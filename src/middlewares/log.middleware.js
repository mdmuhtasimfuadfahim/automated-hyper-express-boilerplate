import { generateTraceCode } from '../utils/traceCode.js';
import logger from '../config/log4js.js';

export default async (req, res, next) => {
  const traceCode = generateTraceCode(req);
  const requestId = req.headers['x-request-id'] || traceCode;

  req.traceCode = traceCode;
  req.requestId = requestId;

  const startTime = Date.now();

  res.on('finish', async () => {
    const logEntry = {
      traceCode,
      requestId,
      ip: req.ip || req.connection.remoteAddress,
      userId: traceCode.split('-')[0],
      time: new Date(),
      method: req.method,
      endpoint: req.originalUrl,
      status: res.statusCode,
      responseTime: Date.now() - startTime,
    };

    try {
      await global.Log.create(logEntry);
      logger.info('Log entry saved successfully');
      next();
    } catch (error) {
      logger.error('Error saving log entry:', error);
      next();
    }
  });
};
