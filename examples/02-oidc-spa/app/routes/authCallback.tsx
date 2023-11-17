import * as React from 'react';
import { Link } from 'react-router-dom';
import { type JWTPayload, decodeJwt } from 'jose';

import { idpConfig } from '../openid.ts';
import { useSessionDispatch } from '../auth.ts';

export default function AuthCallback() {
  const sessionDispatch = useSessionDispatch();

  const [status, setStatus] = React.useState<(
    | { type: 'authorizing' }
    | { type: 'invalid' }
    | { type: 'failed', reason: string }
    | { type: 'done' }
  )>(() => ({ type: 'authorizing' }));

  React.useEffect(() => {
    async function getToken(signal: AbortSignal) {
      const url = new URL(window.location.href);

      const code = url.searchParams.get('code');
      const state = window.localStorage.getItem('oauth_state');
      const pkceEncoded = window.localStorage.getItem('oauth_pkce');

      if (!(code && state && state === url.searchParams.get('state') && pkceEncoded)) {
        setStatus({ type: 'invalid' });
        return;
      }

      const pkce = JSON.parse(pkceEncoded) as {
        code_verifier: string,
      };

      const tokenResponse = await fetch(idpConfig.token_endpoint, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          redirect_uri: url.origin + url.pathname,
          code,
          code_verifier: pkce.code_verifier,
          client_id: import.meta.env.VITE_KARROT_OKTA_CLIENT_ID,
        }),
        signal,
      });

      if (!tokenResponse.ok) {
        setStatus({ type: 'failed', reason: tokenResponse.statusText });
        return;
      }

      const {
        id_token: idToken,
        access_token: accessToken,
      } = await tokenResponse.json() as {
        id_token: string,
        access_token: string,
      };

      const idTokenClaims = decodeJwt(idToken) as Required<JWTPayload> & {
        name: string,
      };

      sessionDispatch({
        status: 'authenticated',
        accessToken,
        idToken,
        idTokenClaims,
      });

      setStatus({ type: 'done' });
    }

    const tokenRequestController = new AbortController();
    void getToken(tokenRequestController.signal);

    return () => {
      tokenRequestController.abort();
    };
  }, []);

  React.useEffect(() => {
    if (status.type === 'done') {
      const returnTo = window.localStorage.getItem('return_to') || '/';

      window.localStorage.removeItem('oauth_state');
      window.localStorage.removeItem('oauth_pkce');
      window.localStorage.removeItem('return_to');

      window.location.replace(returnTo);
    }
  }, [status]);

  switch (status.type) {
    case 'invalid': {
      return (
        <div>
          Invalid request
          <Link to="/">Back to home</Link>
        </div>
      );
    }
    case 'failed': {
      return (
        <div>
          {status.reason}
          <Link to="/">Back to home</Link>
        </div>
      );
    }
    default: {
      return (
        <div>Authorizaing...</div>
      );
    }
  }
}
