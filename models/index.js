import { waterline, dbConfig } from '../config/db-config.js';
import User from './user.model.js';

// Register models
waterline.registerModel(User);

// Register other models as needed
const initializeWaterline = async () => {
    return new Promise((resolve, reject) => {
        waterline.initialize(dbConfig, (err, ontology) => {
            if (err) {
                console.error('Failed to initialize ORM:', err);
                return reject(err);
            }
            console.log('ORM initialized');
            // Make models globally accessible
            global.User = ontology.collections.user;
            resolve(ontology);
        });
    });
};

export default initializeWaterline;