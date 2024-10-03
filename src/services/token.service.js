import logger from '../config/log4js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const tokenService = {
  async generateToken(userId, type) {
    try {
      const tokenValue = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto
        .createHash('sha256')
        .update(tokenValue)
        .digest('hex');
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day

      const tokenPayload = {
        userId,
        type,
        token: hashedToken,
        expires,
      };

      const encryptedToken = jwt.sign(tokenPayload, process.env.TOKEN_SECRET);

      await global.Token.create({
        token: hashedToken,
        user: userId,
        type,
        expires,
      });

      return encryptedToken;
    } catch (error) {
      logger.error('err: ', error);
      throw new Error('Error when generating token');
    }
  },
};

export default tokenService;
