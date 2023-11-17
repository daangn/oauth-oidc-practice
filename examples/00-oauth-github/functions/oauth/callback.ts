import * as Cookie from 'cookie';
import * as db from 'utils/db';
import { Octokit } from '@octokit/core';

const GET: PagesFunction<Env> = async context => {
  const url = new URL(context.request.url);
  const cookie = Cookie.parse(context.request.headers.get('Cookie') || '');
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  if (!(code && state && cookie['oauth_state'] && state === cookie['oauth_state'])) {
    return new Response('Bad request', { status: 400 });
  }

  // Note: GitHub's token_endpoint only supports `client_secret_post` method.
  const tokenRequest = new Request('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      code,
      client_id: context.env.GITHUB_OAUTH_CLIENT_ID,
      client_secret: context.env.GITHUB_OAUTH_CLIENT_SECRET,
    }),
  });

  const tokenResponse = await fetch(tokenRequest);
  if (!tokenResponse.ok) {
    return tokenResponse.clone();
  }

  const {
    access_token: accessToken,
  } = await tokenResponse.json<{
    access_token: string,
  }>();

  const octokit = new Octokit({ auth: accessToken });
  const userResponse = await octokit.request('GET /user');

  const signinResult = db.signin({
    provider: 'github',
    subject: userResponse.data.id.toString(),
    user: {
      name: userResponse.data.name || userResponse.data.login,
      github: userResponse.data.login,
    },
    syncProperties: true,
    allowSignup: true,
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
