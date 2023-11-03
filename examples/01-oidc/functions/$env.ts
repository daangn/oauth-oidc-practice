declare global {
  interface Env {
    OPENID_ISSUER: string;
    OAUTH_CLIENT_ID: string;
    OAUTH_CLIENT_SECRET: string;
  }
}
