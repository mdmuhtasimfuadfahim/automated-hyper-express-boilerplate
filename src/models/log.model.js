import Waterline from 'waterline';

const Log = Waterline.Collection.extend({
  identity: 'log',
  datastore: 'default',
  primaryKey: '_id',
  attributes: {
    _id: {
      type: 'string',
      columnName: '_id',
      autoMigrations: { autoIncrement: false },
    },
    traceCode: { type: 'string', required: true },
    requestId: { type: 'string', required: true },
    ip: { type: 'string', required: true },
    userId: { type: 'string', required: true },
    time: { type: 'string', required: true },
    method: { type: 'string', required: true },
    endpoint: { type: 'string', required: true },
    status: { type: 'number', required: true },
    responseTime: { type: 'number', required: true },
  },
});

export default Log;
