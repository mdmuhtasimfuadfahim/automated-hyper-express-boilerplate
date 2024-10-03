import jwt from 'jsonwebtoken';
import logger from '../config/log4js.js';

export default async function authMiddleware(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    const { userId, type, token: hashedToken, expires } = decoded;

    if (new Date(expires) < new Date()) {
      return res.status(401).json({ error: 'Token expired' });
    }

    const tokenRecord = await global.Token.findOne({
      token: hashedToken,
      user: userId,
      type,
    });

    if (!tokenRecord || tokenRecord.blacklisted) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    req.user = { id: userId };
    next();
  } catch (error) {
    logger.error('err: ', error);
    res.status(401).json({ error: 'Unauthorized' });
  }
}
