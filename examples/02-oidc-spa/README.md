# OpenID Connect - Public Client (SPA) Example

Note: The authorization redirect URL must be `http://127.0.0.1:8788/oauth/callback`.

1. Create `.env.local` file with follwing content
  ```
  OPENID_ISSUER=${YOUR_OPENID_ISSUER}
  OAUTH_CLIENT_ID=${YOUR_OAUTH_CLIENT_ID}
  ```
2. Run `dev` script
3. Open `http://127.0.0.1:8788` in your browser
