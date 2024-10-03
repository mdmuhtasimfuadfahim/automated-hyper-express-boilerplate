import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const generateToken = async (userId, type) => {
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
};

export { generateToken };
