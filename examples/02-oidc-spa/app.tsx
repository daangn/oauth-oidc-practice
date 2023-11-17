import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import {
  type Session,
  SessionContext,
  SessionDispatchContext,
} from './app/auth.ts';
import Home from './app/routes/home.tsx';
import AuthCallback from './app/routes/authCallback.tsx';

const rootEl = document.getElementById('root')!;
const root = ReactDOM.createRoot(rootEl);
const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/oauth/callback',
    element: <AuthCallback />,
  },
]);

function App() {
  const [session, sessionDispatch] = React.useState<Session>(() => ({ status: 'unauthenticated' }));

  React.useEffect(() => {
    const sessionEncoded = window.localStorage.getItem('session');
    if (sessionEncoded) {
      const session = JSON.parse(sessionEncoded);
      sessionDispatch(session);
    }
  }, []);

  const sessionDispatchWithPersist = React.useCallback((session: Session) => {
    window.localStorage.setItem('session', JSON.stringify(session));
    sessionDispatch(session);
  }, []);

  return (
    <SessionDispatchContext.Provider value={sessionDispatchWithPersist}>
      <SessionContext.Provider value={session}>
        <RouterProvider router={router} />
      </SessionContext.Provider>
    </SessionDispatchContext.Provider>
  );
}

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
