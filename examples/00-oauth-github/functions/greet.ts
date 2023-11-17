import * as Cookie from 'cookie';
import * as db from 'utils/db';
import { html } from 'common-tags';

const GET: PagesFunction<Env> = context => {
  const cookie = Cookie.parse(context.request.headers.get('Cookie') || '');

  const sessionId = cookie.session_id;
  const session = sessionId && db.findSessionUser({ sessionId });
  if (!session) {
    return new Response(html`
      Who are you?
      <a href="/oauth">Login with GitHub</a>
    `);
  }

  const user = session.user;
  return new Response(`Hello, ${user.name}!`);
};

export const onRequest: PagesFunction<Env> = context => {
  switch (context.request.method) {
    case 'GET':
      return GET(context);
    default:
      return new Response('Not allowed', { status: 405 });
  }
};
