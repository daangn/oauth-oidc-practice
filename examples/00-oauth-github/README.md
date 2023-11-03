# GitHub OAuth 2.0 Example

1. [Create a new OAuth 2.0 App](https://github.com/settings/applications/new)
  - Authorization callback URL: `https://127.0.0.1:8788/oauth/callback`
2. Generate a client secret and copy it
3. Create `.dev.vars` file with follwing content
  ```
  GITHUB_OAUTH_CLIENT_ID=${YOUR_OAUTH_CLIENT_ID}
  GITHUB_OAUTH_CLIENT_SECRET=${YOUR_OAUTH_CLIENT_SECRET}
  ```
4. Run `dev` script
5. Open `http://127.0.0.1:8788` in your browser
