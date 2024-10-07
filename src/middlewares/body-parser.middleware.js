import logger from '../config/log4js.js';

export default (req, res, next) => {
  req
    .json()
    .then((body) => {
      req.body = body || {};
      next();
    })
    .catch((err) => {
      logger.error('Error parsing JSON:', err);
      res.status(400).send('Invalid JSON');
    });
};
