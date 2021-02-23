const redis = require('redis');
const util = require('util');
const { logger } = require('../config/logger');

const REDIS_HOST = process.env.REDIS_HOST ? process.env.REDIS_HOST : '127.0.0.1';
const REDIS_PORT = process.env.REDIS_PORT ? process.env.REDIS_PORT : 6379;
// TODO: add REDIS_URL to connect outside localhost with credentials etc.

const client = redis.createClient({
    host: REDIS_HOST,
    port: REDIS_PORT,
});
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
