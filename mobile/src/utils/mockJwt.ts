// src/utils/mockJwt.ts
import { jwtDecode, type JwtPayload } from 'jwt-decode';
import { UserProfile } from '@/contexts/ctx';

export interface UserPayload extends UserProfile, JwtPayload {}

// Hermes has no WebCrypto (crypto.subtle), so we can't HMAC-sign here.
// That's fine: signing/verifying belongs on the server. The app only needs a
// token with the same shape as a real JWT so jwt-decode and storage work.
const MOCK_SIGNATURE = 'mock-signature';
const EXPIRES_IN_SECONDS = 2 * 60 * 60; // 2 hours

function base64UrlEncode(value: object): string {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Simulates generating a JWT token locally in the frontend
 * @param {Object} payload - User data to embed in the token
 */
export async function simulateGenerateToken(payload: UserPayload): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'HS256', typ: 'JWT' };
  const body = { ...payload, iat: now, exp: now + EXPIRES_IN_SECONDS };

  return `${base64UrlEncode(header)}.${base64UrlEncode(body)}.${MOCK_SIGNATURE}`;
}

/**
 * Simulates validating a JWT token locally in the frontend.
 * Only checks structure and expiry — real signature checks happen on the server.
 * @param {string} token - The JWT string to verify
 */
export const simulateVerifyToken = async (token: string): Promise<UserPayload | null> => {
  try {
    const payload = jwtDecode<UserPayload>(token);
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      throw new Error('Token expired');
    }
    return payload; // Returns decoded payload if valid
  } catch (e) {
    console.error("Token verification failed:", e);
    return null; // Token is expired or malformed
  }
};
