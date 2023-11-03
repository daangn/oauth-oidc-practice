const GET: PagesFunction<Env> = context => {
  return new Response('Who are you?');
};

export const onRequest: PagesFunction<Env> = context => {
  switch (context.request.method) {
    case 'GET':
      return GET(context);
    default:
      return new Response('Not allowed', { status: 405 });
  }
};
