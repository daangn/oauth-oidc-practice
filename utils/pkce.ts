export function generateVerifier(): string {
  const array = new Uint8Array(56 / 2);
  crypto.getRandomValues(array);
  return Array.from(array, dec2hex).join('');
}

export async function generateChallenge(v: string) {
  const s256 = await sha256(v);
  return base64url(s256);
}

export async function generateVerifierPair() {
  const verifier = generateVerifier();
  const challenge = await generateChallenge(verifier);

  return {
    code_challenge_method: 'S256',
    code_verifier: verifier,
    code_challenge: challenge,
  };
}

function dec2hex(dec: number) {
  return ('0' + dec.toString(16)).substring(-2);
}

function sha256(plain: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return crypto.subtle.digest("SHA-256", data);
}

function base64url(buf: ArrayBuffer) {
  let str = '';
  const bytes = new Uint8Array(buf);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    str += String.fromCharCode(bytes[i]);
  }
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}
