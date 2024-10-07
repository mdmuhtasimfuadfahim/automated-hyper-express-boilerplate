import { waterline, dbConfig } from '../config/db-config.js';
import User from './user.model.js';
import Token from './token.model.js';
import Log from './log.model.js';
import logger from '../config/log4js.js';

// Register models
waterline.registerModel(User);
waterline.registerModel(Token);
waterline.registerModel(Log); // Register the Log model

// Register other models as needed
const initializeWaterline = async () => {
  return new Promise((resolve, reject) => {
    waterline.initialize(dbConfig, (err, ontology) => {
      if (err) {
        logger.error('Failed to initialize ORM:', err);
        return reject(err);
      }
      logger.info('ORM initialized');
      // Make models globally accessible
      global.User = ontology.collections.user;
      global.Token = ontology.collections.token;
      global.Log = ontology.collections.log;
      resolve(ontology);
    });
  });
};

export default initializeWaterline;
