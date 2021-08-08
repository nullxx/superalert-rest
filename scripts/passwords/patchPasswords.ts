// 20-07-2021 script to migrate plain text passwords into hashed ones.
import Logger from '../../src/lib/logger';
import { connection } from '../../src/config/database';
import { hash } from '../../src/lib/crypto';

const logger = Logger('debug', __filename);
const usersCollection = connection.get('users');

usersCollection.find().then((users) => {
    logger.debug(users);
    users.forEach(async (user) => {
        logger.debug('Updating with email', user.email);
        usersCollection.update({ _id: user._id }, { $set: { password: await hash(user.password) } });
    });
});
