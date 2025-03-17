import { AuthOptions, AuthResponse } from '../types/auth';
import axios from 'axios';

const BASE_URL = 'http://localhost:3333'
/**
 * Initiates passkey registration.
 * @param email - User's email.
 * @returns WebAuthn registration options.
 * @example
 * const options = await startRegistration('user@example.com');
 */
export const startRegistration = (email: string): Promise<AuthOptions> =>
  axios.post(BASE_URL + '/register/start', { email }).then((res) => res.data);
  // apiFetch('/register/start', {
  //   method: 'POST',
  //   body: JSON.stringify({ email }),
  // }).then((res) => res.data);

/**
 * Completes passkey registration.
 * @param email - User's email.
 * @param attestationResponse - WebAuthn attestation response.
 * @returns Success status.
 */
export const finishRegistration = (
  email: string,
  attestationResponse: any
): Promise<{ success: boolean }> =>
  axios.post('/register/finish', {
    body: JSON.stringify({ email, attestationResponse }),
  }).then((res) => res.data);

/**
 * Initiates passkey login.
 * @param email - User's email.
 * @returns WebAuthn authentication options.
 */
export const startLogin = (email: string): Promise<AuthOptions> =>
  axios.post('/login/start', {
    body: JSON.stringify({ email }),
  }).then((res) => res.data);

/**
 * Completes passkey login.
 * @param assertionResponse - WebAuthn assertion response.
 * @returns JWT token.
 */
export const finishLogin = (assertionResponse: any): Promise<{ token: string }> =>
  axios.post('/login/finish', {
    body: JSON.stringify({ assertionResponse }),
  }).then((res) => res.data);

/**
 * Requests account recovery.
 * @param email - User's email.
 * @returns Success status.
 */
export const recoverAccount = (email: string): Promise<{ success: boolean }> =>
  axios.post('/recover', {
    body: JSON.stringify({ email }),
  }).then((res) => res.data);