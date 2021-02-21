const redis = require('redis');
const util = require('util');
const { logger } = require('../config/logger');

const client = redis.createClient();
const redisSet = util.promisify(client.set).bind(client);
const redisGet = util.promisify(client.get).bind(client);

async function getUser(username) {
    logger.debug(`Calling redis for a user by username: ${username}`);
    const userValue = await redisGet(username);
    return JSON.parse(userValue);
}

async function saveUser(user) {
    logger.debug(`Saving a user: ${user.username}`);
    const redisKey = user.username;
    const redisValue = JSON.stringify(user);
    return redisSet(redisKey, redisValue);
}

async function quitRedis() {
    return client.quit(() => logger.warn('Redis connection has been killed on request! This should happen during tests'));
}

module.exports = {
    getUser,
    saveUser,
    quitRedis,
};
