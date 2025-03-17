export interface AuthOptions {
    challenge: string;
    rp: { name: string; id: string };
    user?: { id: string; name: string; displayName: string };
    pubKeyCredParams: { type: string; alg: number }[];
    authenticatorSelection?: { userVerification: 'preferred' | 'required' };
    allowCredentials?: { type: string; id: string }[];
  }
  
  export interface AuthResponse {
    id: string;
    rawId: number[];
    type: string;
    response: {
      clientDataJSON: number[];
      attestationObject?: number[];
      authenticatorData?: number[];
      signature?: number[];
      userHandle?: number[] | null;
    };
  }
