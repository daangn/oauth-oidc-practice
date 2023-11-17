import * as React from 'react';

import { useAuth } from '../auth.ts';

export default function Home(): React.ReactNode {
  const { currentUser, login } = useAuth();
  if (currentUser) {
    return <div>Hello, {currentUser.name}!</div>;
  } else {
    return (
      <div>
        Who are you?
        <button
          onClick={() => login()}
        >
          Login with OpenID Connect
        </button>
      </div>
    );
  }
}
