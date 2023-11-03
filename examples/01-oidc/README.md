# OpenID Connect - Credential Client Example

Note: The authorization redirect URL must be `http://127.0.0.1:8788/oauth/callback`.

1. Create `.dev.vars` file with follwing content
  ```
  OPENID_ISSUER=${YOUR_OPENID_ISSUER}
  OAUTH_CLIENT_ID=${YOUR_OAUTH_CLIENT_ID}
  OAUTH_CLIENT_SECRET=${YOUR_OAUTH_CLIENT_SECRET}
  ```
2. Run `dev` script
3. Open `http://127.0.0.1:8788` in your browser
