/*
 * src/hooks/useAuth.ts
 * Hook to manage authentication using passkey flow.
 */
import { create } from 'zustand';
import { useMutation } from '@tanstack/react-query';

import { setStorage } from '@/lib/utils';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY} from '@/lib/constants';
import { AuthOptions, AuthResponse } from '@/lib/types';
import { startRegistration, finishRegistration,  startLogin, finishLogin, recoverAccount } from '@/lib/auth';
import { base64URLStringToBuffer } from '@simplewebauthn/browser';

// Define interfaces for auth state, credentials, and API responses

export interface UserAuthDetails { 
  email: string;
  accessToken: string | null;
  refreshToken: string | null;
}
export interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  doLogin: (user: UserAuthDetails) => Promise<void>;
  doRegistration: (user: UserAuthDetails) => Promise<void>;
  doAccountRecovery: (user: UserAuthDetails) => Promise<void>;
}

export interface AuthCredentials {
  access: string;
  refresh: string;
}

export interface CreatePasskeyResponse {
  success: boolean;
  challenge: string;
}

export interface UsePasskeyRequest {
  challenge: string;
  credential?: string;
}

export interface UsePasskeyResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
}

export interface AuthActions {
  signIn: (credentials: AuthCredentials) => Promise<void>;
  signOut: () => void;
  createPasskey: () => Promise<CreatePasskeyResponse>;
  usePasskey: (request: UsePasskeyRequest) => Promise<UsePasskeyResponse>;
}

export type AuthStore = AuthState & AuthActions;

// Create the auth store using Zustand in a functional style.
export const useAuthStore = create<AuthStore>((set) => ({
  // Initial state
  isAuthenticated: false,
  accessToken: null,
  refreshToken: null,
  // accessToken: getStorage('token'),
  
  // Action to sign in with credentials (if needed)
  signIn: async (credentials): Promise<void> => {
    try {
      const options = await startLogin.mutateAsync({ email: credentials });
      const assertion = await navigator.credentials.get({ publicKey: options });
      const { token } = await finishLogin.mutateAsync({ assertionResponse: assertion });
      setStorage('token', token);
      // throw new Error('Login successful!');
    } catch (error) {
      throw new Error(`Login failed: ${(error as Error).message}`);
    }
    
    set({
      isAuthenticated: true,
      accessToken: credentials.access,
      refreshToken: credentials.refresh,
    });
  },
  
  // Action to sign out
  signOut: (): void => {
    // remStorage('token');
    set({
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
    });
  },
  
  // Action to create a passkey challenge by calling the backend API route
  createPasskey: async ({email}: UserAuthDetails): Promise<CreatePasskeyResponse> => {
      try {
        const options = await startRegistration.mutateAsync({ email });
        const credential = await navigator.credentials.create({ publicKey: options });
        await finishRegistration.mutateAsync({ email, attestationResponse: credential });
        // setMessage('Registration successful!');
      } catch (error) {
        // setMessage(`Registration failed: ${(error as Error).message}`);
      }
  },
  
  // Action to use a passkey for authentication by calling the backend API route and updating state accordingly.
  usePasskey: async (request: UsePasskeyRequest): Promise<UsePasskeyResponse> => {
    try {
      const response = await fetch('/api/use-passkey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      const data: UsePasskeyResponse = await response.json();
      if (data.success) {
        set({
          isAuthenticated: true,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        });
        return data;
      } else {
        throw new Error('Passkey usage failed');
      }
    } catch (error) {
      console.error('Error during passkey usage:', error);
      throw error;
    }
  },
  doRegistration: async ({email}: UserAuthDetails) => {
    console.log('hook:doRegistration: email', email);
    const options = await startRegistration(email);
    console.log('hook:doRegistration: navigator', navigator.credentials.create);
    try {
      // const challengeBuffer = new Uint8Array(options.challenge);
      // apparently server is kinda retarded and uses non standard base64 + malformed user
      const challengeBuffer = base64URLStringToBuffer(options.challenge);
      const user = {
        // id: base64URLStringToBuffer(options.user.id),
        id: base64URLStringToBuffer(options.user.id),
        name: email,
        displayName: email
      }
      const publicKey = {
        ...options,
        challenge: challengeBuffer,
        user
      };
      console.log('hook:doRegistration: options', publicKey);
      const credential = await navigator.credentials.create({publicKey});
      console.log('hook:doRegistration: credentials', credential);
      return finishRegistration(email, credential);

    } catch(error) {
      console.error('hook:doRegistration: error', error);
    }
    // full data model
    // const credential = await navigator.credentials.create({
    //   publicKey: {
    //     challenge: Uint8Array.from(atob(serverChallenge), c => c.charCodeAt(0)),
    //     rp: { name: "MyApp" },
    //     user: {
    //       id: Uint8Array.from(email, c => c.charCodeAt(0)),
    //       name: email,
    //       displayName: email
    //     },
    //     pubKeyCredParams: [{ type: "public-key", alg: -7 }],
    //     authenticatorSelection: { userVerification: "preferred" }
    //   }
    // });
  },
  doLogin: async ({email}: UserAuthDetails): Promise<void> => {
    const options = await startLogin(email);
    const assertion = await navigator.credentials.get({ publicKey: options });
    const authTokens = finishLogin(assertion);

    setStorage('hook:doLogin authTokens', authTokens);
    set({ ...authTokens, isAuthenticated: true });
  },
  doAccountRecovery: async ({email}: UserAuthDetails): Promise<void> => {
    return recoverAccount(email);
  },
  

}));


/**
 * Hook to consume authentication store.
 * @returns Authentication related functions and state.
 */
function useAuth(): AuthActions & { authState: AuthState } {
  const { signIn, signOut, 
    doRegistration,
    doLogin,
    doAccountRecovery, createPasskey, usePasskey, isAuthenticated, accessToken, refreshToken } = useAuthStore();
  return {
    /// bloat
    signIn,
    signOut,
    createPasskey,
    usePasskey,
    /// keepers
    doRegistration,
    doLogin,
    doAccountRecovery, 
    authState: { isAuthenticated, accessToken, refreshToken },
  };
}

export default useAuth;