import Waterline from 'waterline';

const User = Waterline.Collection.extend({
  identity: 'user',
  datastore: 'default',
  primaryKey: '_id',

  attributes: {
    _id: {
      type: 'string',
      columnName: '_id',
      autoMigrations: { autoIncrement: false },
    },
    email: { type: 'string', required: true },
    name: { type: 'string', required: true },
    password: { type: 'string', required: true },
    role: { type: 'string', defaultsTo: 'user' },
  },

  beforeValidate: function (values, cb) {
    const validRoles = ['user', 'admin'];
    if (!validRoles.includes(values.role)) {
      return cb(new Error('Invalid role'));
    }
    return cb();
  },

  afterValidate: function (values, cb) {
    const validRoles = ['user', 'admin'];
    if (!validRoles.includes(values.role)) {
      return cb(new Error('Invalid role'));
    }
    return cb();
  },
});

export default User;
