// https://github.com/MasterKale/SimpleWebAuthn/blob/master/example/index.ts

import express from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  WebAuthnCredential,
} from '@simplewebauthn/server';
import { isoUint8Array } from '@simplewebauthn/server/helpers';

import db from './db';


const JWT_SECRET = 'your-secret-key'; // Replace 
const SESSION_SECRET = 'your-secret-key'; // Replace
const RP_ID = process.env.RP_ID || 'localhost';
interface User {
  id: string;
};
export interface AuthedRequest extends express.Request {
  user?: User;
  session: any;
}

// **Registration Routes**

/*
 * @name /register/start
 * @description Generate WebAuthn registration options
 * @param {string} email - The email of the user
 * @returns {object} - The registration options object
 */
export const startRegistration = async (req: AuthedRequest, res: express.Response) => {
  const { email } = req.body;
  console.log("auth:register:email", email);
  if (!email) return res.status(400).json({ error: 'Email is required' });
  
  // console.log("auth:register:email", db.get('SELECT * FROM users WHERE email = ?', [email]));
  try {
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err: any, user: any) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (user) return res.status(400).json({ error: 'User already exists' });
      
      const options = await generateRegistrationOptions({
        rpName: 'Ryokou-san',
        rpID: RP_ID,
        userID: isoUint8Array.fromUTF8String(uuid()),
        
        userName: email,
        attestationType: 'none',
        authenticatorSelection: { userVerification: 'preferred' },
        /**
         * Passing in a user's list of already-registered credential IDs here prevents users from
         * registering the same authenticator multiple times. The authenticator will simply throw an
         * error in the browser if it's asked to perform registration when it recognizes one of the
         * credential ID's.
         */
        // excludeCredentials: credentials.map((cred) => ({
        //   id: cred.id,
        //   type: 'public-key',
        //   transports: cred.transports,
        // })),
      });

      console.log("auth:register:options", options);
  
      req.session.challenge = options.challenge;
      req.session.email = email;
  
      res.json(options);
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Database error: ' + error  });
  }
};

// /register/finish - Verify registration response and store credentials
export const finishRegistration = async (req: AuthedRequest, res: express.Response) => {
  const { email, attestationResponse } = req.body;
  const expectedChallenge = req.session.challenge;

  if (!email || !attestationResponse || !expectedChallenge) {
    return res.status(400).json({ error: 'Missing required data' });
  }

  try {
    const verification = await verifyRegistrationResponse({
      response: attestationResponse,
      expectedChallenge,
      expectedOrigin: 'http://localhost:3333', // Replace with your origin
      expectedRPID: RP_ID,
      requireUserVerification: false,
    });

    if (!verification.verified) {
      return res.status(400).json({ error: 'Verification failed' });
    }

    db.run('INSERT INTO users (email) VALUES (?)', [email], function (err: any) {
      if (err) return res.status(500).json({ error: 'Database error' });
      const userId = req.session.user.id;

      const { credentialType, credential: { id, publicKey, counter, }, } = verification.registrationInfo!;
      // need to add transports here?
      db.run(
        'INSERT INTO credentials (user_id, credential_id, public_key, counter) VALUES (?, ?, ?, ?)',
        [userId, credentialType, publicKey, counter],
        (err: any) => {
          if (err) return res.status(500).json({ error: 'Database error' });
          delete req.session.challenge;
          res.json({ success: true });
        }
      );
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Verification error: ' + error });
  }
};

// **Login Routes**

// /login/start - Generate WebAuthn authentication options
export const loginStart = async (req: AuthedRequest, res: express.Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err: any, user: User) => {
    if (err || !user) return res.status(404).json({ error: 'User not found' });

    db.all('SELECT credential_id FROM credentials WHERE user_id = ?', [user.id], async (err: any, credentials: WebAuthnCredential[]) => {
      if (err || credentials.length === 0) {
        return res.status(404).json({ error: 'No credentials found' });
      }

      const allowCredentials = credentials.map((cred) => ({
        type: 'public-key',
        id: cred.id,
        // transports: cred.transports, // TODO?
      }));

      const options = await generateAuthenticationOptions({
        rpID: 'localhost', // Replace with your domain
        allowCredentials,
        userVerification: 'preferred',
      });

      req.session.challenge = options.challenge;
      req.session.userId = user.id;

      res.json(options);
    });
  });
};

// /login/finish - Verify authentication response and issue JWT
export const loginFinish = async (req: AuthedRequest, res: express.Response) => {
  const { assertionResponse } = req.body;
  const expectedChallenge = req.session.challenge;
  const userId = req.session.userId;

  if (!assertionResponse || !expectedChallenge || !userId) {
    return res.status(400).json({ error: 'Missing required data' });
  }

  db.all('SELECT * FROM credentials WHERE user_id = ? AND credential_id = ?', [userId, assertionResponse.id], async (err: any, credentials: WebAuthnCredential[]) => {
    if (err || credentials.length === 0) {
      return res.status(404).json({ error: 'No credentials found' });
    }

    for (const cred of credentials) {
      try {
        const verification = await verifyAuthenticationResponse({
          response: assertionResponse,
          expectedChallenge,
          expectedOrigin: 'http://localhost:3333', // Replace with your origin
          expectedRPID: RP_ID,
          credential: cred,
          requireUserVerification: false,
        });

        if (verification.verified) {
          db.run('UPDATE credentials SET counter = ? WHERE id = ?', [verification.authenticationInfo.newCounter, cred.id]);
          const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
          req.session.currentChallenge = undefined;
          return res.json({ token });
        }
      } catch (error) {
        console.error(error);
      }
    }

    res.status(400).json({ error: 'Authentication failed' });
  });
};
