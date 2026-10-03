import { findValidSession } from '../models/sessionModel.js';
import { findUserById, toPublicUser } from '../models/userModel.js';

// Put this in front of any route that needs a logged-in user.
export const requireAuth = (req, res, next) => {
  const sessionId = req.cookies?.sessionId;
  if (!sessionId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const session = findValidSession(sessionId);
  if (!session) {
    return res.status(401).json({ message: 'Invalid or expired session' });
  }

  const user = findUserById(session.user_id);
  if (!user) {
    return res.status(401).json({ message: 'User not found' });
  }

  req.user = toPublicUser(user);
  next();
};