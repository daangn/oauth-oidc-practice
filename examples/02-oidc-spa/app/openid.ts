const configEndpoint = new URL(
  '.well-known/openid-configuration',
  import.meta.env.VITE_OPENID_ISSUER,
);

export const idpConfig = await fetch(configEndpoint).then(res => res.json()) as {
  authorization_endpoint: string,
  token_endpoint: string,
};
