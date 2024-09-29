import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  skipSuccessfulRequests: true,
});

export default apiLimiter;
