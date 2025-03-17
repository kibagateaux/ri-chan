/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import * as path from 'path';

import express from 'express';
import session from 'express-session';
import jwt from 'jsonwebtoken';
import cors from 'cors';

import { startRegistration, finishRegistration, loginStart, loginFinish, AuthedRequest } from './auth';
 
const app = express();

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Session middleware for storing challenges
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'hjvjvlhg',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' } 
  })
);

// Middleware to verify JWT for protected routes
const authenticateJWT = (req: AuthedRequest, res: express.Response, next: express.NextFunction) => {
  const token = req.headers?.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  jwt.verify(token, process.env.JWT_SECRET ?? '', (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Forbidden' });
    req.user = user;
    next();
  });
};


app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to api!' });
});


app.post('/register/start', startRegistration);
app.post('/register/finish', finishRegistration);
app.post('/login/start', loginStart);
app.post('/login/finish', loginFinish);

// **Protected Route Example**
// app.get('/protected', authenticateJWT, (req: AuthedRequest, res: express.Response) => {
//   res.json({ message: 'This is a protected route', user: req.user });
// });


const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
server.on('error', console.error);

export default app;