import * as Cookie from 'cookie';

const GET: PagesFunction<Env> = async context => {
  const url = new URL(context.request.url);
  const callbackUrl = new URL('/oauth/callback', url);
  const returnTo = url.searchParams.get('return_to');

  const state = crypto.randomUUID();

  const openidConfigEndpoint = new URL('.well-known/openid-configuration', context.env.OPENID_ISSUER);
  const openidConfig = await fetch(openidConfigEndpoint).then(res => res.json<{
    authorization_endpoint: string,
  }>());

  const authz = new URL(openidConfig.authorization_endpoint);
  authz.searchParams.set('response_type', 'code');
  authz.searchParams.set('client_id', context.env.OAUTH_CLIENT_ID);
  authz.searchParams.set('redirect_uri', callbackUrl.toString());
  authz.searchParams.set('scope', 'openid profile');
  authz.searchParams.set('state', state);

  const headers = new Headers({
    Location: authz.toString(),
  });

  headers.append(
    'Set-Cookie',
    Cookie.serialize('oauth_state', state, {
      path: callbackUrl.pathname,
      maxAge: 300,
      sameSite: 'lax',
      httpOnly: true,
      secure: true,
    }),
  );

  if (returnTo) {
    headers.append(
      'Set-Cookie',
      Cookie.serialize('return_to', returnTo, {
        path: callbackUrl.pathname,
        maxAge: 300,
        sameSite: 'lax',
        httpOnly: true,
        secure: true,
      }),
    );
  }

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
