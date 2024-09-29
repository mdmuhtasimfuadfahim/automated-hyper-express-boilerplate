import Waterline from 'waterline';

const Token = Waterline.Collection.extend({
  identity: 'token',
  datastore: 'default',
  primaryKey: '_id',

  attributes: {
    _id: {
      type: 'string',
      columnName: '_id',
      autoMigrations: { autoIncrement: false },
    },
    token: { type: 'string', required: true },
    user: { model: 'user', required: true },
    type: { type: 'string', required: true },
    expires: { type: 'ref', required: true },
    blacklisted: { type: 'boolean', defaultsTo: false },
  },

  beforeValidate: function (values, cb) {
    const validTypes = ['access', 'refresh', 'resetPassword', 'verifyEmail'];
    if (!validTypes.includes(values.type)) {
      return cb(new Error('Invalid token type'));
    }
    return cb();
  },

  afterValidate: function (values, cb) {
    const validTypes = ['access', 'refresh', 'resetPassword', 'verifyEmail'];
    if (!validTypes.includes(values.type)) {
      return cb(new Error('Invalid token type'));
    }
    return cb();
  },

  beforeCreate(values, cb) {
    values._id = values._id || Waterline.utils.uuid();
    cb();
  },
});

export default Token;
