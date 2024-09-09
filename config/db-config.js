import dotenv from 'dotenv';
import Waterline from 'waterline';
import sailsDiskAdapter from 'sails-disk';
import mongoAdapter from 'sails-mongo';

dotenv.config();

const waterline = new Waterline();

const dbConfig = {
    adapters: {
        'disk': sailsDiskAdapter,
        'mongo': mongoAdapter
    },
    datastores: {
        default: {
            adapter: 'mongo',
            url: process.env.MONGODB_URI
        }
    }
};

export { waterline, dbConfig };