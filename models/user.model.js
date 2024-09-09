import Waterline from 'waterline';

const User = Waterline.Collection.extend({
    identity: 'user',
    datastore: 'default',
    primaryKey: '_id',

    attributes: {
        _id: { type: 'string', columnName: '_id', autoMigrations: { autoIncrement: false } },
        email: { type: 'string', required: true },
        name: { type: 'string', required: true },
        password: { type: 'string', required: true },
    }
});

export default User;