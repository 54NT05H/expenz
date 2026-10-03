import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { rateLimit } from 'express-rate-limit';
import { config } from '../config.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { createUser, findUserByEmail, toPublicUser } from '../models/userModel.js';
import { createSession, deleteSession } from '../models/sessionModel.js';

const router = Router();

// Slows down password guessing: 30 attempts per IP per 15 minutes.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => config.isTest,
  message: { message: 'Too many attempts. Please try again in a few minutes.' },
});

const setSessionCookie = (res, session) => {
  res.cookie('sessionId', session.id, {
    httpOnly: true, // JavaScript in the page can't read it
    sameSite: 'lax',
    secure: config.isProduction, // HTTPS-only in production
    path: '/',
    maxAge: config.sessionMs,
  });
};

router.post(
  '/register',
  authLimiter,
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body ?? {};

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    const cleanEmail = String(email).trim();
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      return res.status(400).json({ message: 'Enter a valid email address' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    if (findUserByEmail(cleanEmail)) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(String(password), 10);

    let user;
    try {
      user = createUser({ name: String(name).trim(), email: cleanEmail, passwordHash });
    } catch (err) {
      // Two people registering the same email at the same instant: the database wins.
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(409).json({ message: 'User already exists' });
      }
      throw err;
    }

    setSessionCookie(res, createSession(user.id));
    return res.status(201).json({ success: true, user });
  })
);

router.post(
  '/login',
  authLimiter,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = findUserByEmail(String(email).trim());
    // Same message for "no such user" and "wrong password": don't reveal which emails exist.
    if (!user || !(await bcrypt.compare(String(password), user.password_hash))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    setSessionCookie(res, createSession(user.id));
    return res.json({ success: true, user: toPublicUser(user) });
  })
);

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

router.post('/logout', (req, res) => {
  const sessionId = req.cookies?.sessionId;
  if (sessionId) deleteSession(sessionId); // kill it on the server, not just in the browser
  res.clearCookie('sessionId', { path: '/' });
  res.json({ success: true, message: 'Logged out successfully' });
});

export default router;