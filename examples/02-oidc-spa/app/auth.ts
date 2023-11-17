import * as React from 'react';

import { idpConfig } from './openid.ts';
import { generateVerifierPair } from 'utils/pkce';

export type User = {
  name: string,
}

export type Session = (
  | {
    status: 'unauthenticated',
  }
  | {
    status: 'authenticated'
    idToken: string,
    idTokenClaims: { sub: string, name: string },
    accessToken: string,
  }
);

export const SessionContext = React.createContext<Session>({
  status: 'unauthenticated',
});

export function useSession(): Session {
  return React.useContext(SessionContext);
}

export const SessionDispatchContext = React.createContext(
  (_session: Session) => {},
);

export function useSessionDispatch() {
  return React.useContext(SessionDispatchContext);
}

export function useCurrentUser(): User | null {
  const session = useSession();
  if (session.status === 'authenticated') {
    return {
      name: session.idTokenClaims.name,
    };
  }
  return null;
}

export function useLogin() {
  return React.useCallback((returnTo = '/') => {
    async function setupAndRedirect() {
      const callbackUrl = new URL('/oauth/callback', window.location.href);

      const authz = new URL(idpConfig.authorization_endpoint);
      authz.searchParams.set('response_type', 'code');
      authz.searchParams.set('client_id', import.meta.env.VITE_OAUTH_CLIENT_ID);
      authz.searchParams.set('redirect_uri', callbackUrl.toString());
      authz.searchParams.set('scope', 'openid profile');

      const state = crypto.randomUUID();
      authz.searchParams.set('state', state);

      const pkce = await generateVerifierPair();
      authz.searchParams.set('code_challenge_method', pkce.code_challenge_method);
      authz.searchParams.set('code_challenge', pkce.code_challenge);

      window.localStorage.setItem('oauth_state', state);
      window.localStorage.setItem('oauth_pkce', JSON.stringify(pkce));
      window.localStorage.setItem('return_to', returnTo);

      window.location.replace(authz.toString());
    }

    void setupAndRedirect();
  }, []);
}

export function useAuth() {
  const currentUser = useCurrentUser();
  const login = useLogin();

  return React.useMemo(() => ({
    currentUser,
    login,
  }), [currentUser]);
}
