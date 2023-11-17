import * as Cookie from 'cookie';
import { decodeJwt } from 'jose';
import * as db from 'utils/db';

const GET: PagesFunction<Env> = async context => {
  const url = new URL(context.request.url);
  const cookie = Cookie.parse(context.request.headers.get('Cookie') || '');
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  if (!(code && state && cookie['oauth_state'] && state === cookie['oauth_state'])) {
    return new Response('Invalid state', { status: 400 });
  }

  const openidConfigEndpoint = new URL('.well-known/openid-configuration', context.env.OPENID_ISSUER);
  const openidConfig = await fetch(openidConfigEndpoint).then(res => res.json<{
    token_endpoint: string,
  }>());

  const basicAuth = btoa([
    context.env.OAUTH_CLIENT_ID,
    context.env.OAUTH_CLIENT_SECRET,
  ].join(':'));

  const tokenRequest = new Request(openidConfig.token_endpoint, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      redirect_uri: url.origin + url.pathname,
      code,
    }),
  });

  const tokenResponse = await fetch(tokenRequest);
  if (!tokenResponse.ok) {
    return new Response(tokenResponse.statusText, { status: tokenResponse.status });
  }

  const {
    id_token: idToken,
  } = await tokenResponse.json<{
    id_token: string,
    access_token: string,
  }>();

  const claims = decodeJwt(idToken);

  const signinResult = db.signin({
    provider: 'oidc',
    subject: claims.sub!,
    allowSignup: true,
    syncProperties: true,
    user: {
      name: claims.name as string,
    },
  });

  if (!signinResult) {
    return new Response('Account doesn\'t exist', { status: 400 });
  }

  const { return_to: returnTo = '/' } = cookie;
  const returnUrl = new URL(returnTo, url);

  const headers = new Headers({
    Location: returnUrl.toString(),
  });

  headers.append(
    'Set-Cookie',
    Cookie.serialize('session_id', signinResult.session.id, {
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
      sameSite: 'strict',
      secure: true,
      httpOnly: true,
    }),
  );

  // cleanup
  headers.append(
    'Set-Cookie',
    Cookie.serialize('oauth_state', '', {
      path: '/',
      expires: new Date(0),
    }),
  );
  headers.append(
    'Set-Cookie',
    Cookie.serialize('reutrn_to', '', {
      path: '/',
      expires: new Date(0),
    }),
  );

  return new Response(null, {
    status: 302,
    headers,
  });
};

export const onRequest: PagesFunction<Env> = context => {
  switch (context.request.method) {
    case 'GET':
      return GET(context);
    default:
      return new Response('Not allowed', { status: 405 });
  }
};
