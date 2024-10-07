import jwt from 'jsonwebtoken';
import logger from '../config/log4js.js';

export const generateTraceCode = (req) => {
  const token = req.headers.authorization?.split(' ')[1];
  let userId = '0';

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
      userId = decoded.userId || '0';
    } catch (error) {
      logger.error('Error decoding token:', error);
    }
  }

  const ip = req.ip || req.connection.remoteAddress;
  const time = Date.now();

  return `${userId}-${time}-${ip}`;
};
