const { expect } = require('chai');
const redis = require('redis');
const util = require('util');

const service = require('../../src/userService');

const redisClient = redis.createClient(); /* assuming it's running locally */
const redisSet = util.promisify(redisClient.set).bind(redisClient);
const redisGet = util.promisify(redisClient.get).bind(redisClient);
const redisDel = util.promisify(redisClient.del).bind(redisClient);

describe('userService', () => {
    let tetsUser;

    beforeEach(() => {
        tetsUser = {
            username: 'john',
            password: 'gimMe200$',
            created: 1613855775,
        };
    });

    afterEach(async () => {
        await redisDel(tetsUser.username);
    });

    after(() => {
        redisClient.quit(() => console.log('Quitting redis connection'));
        service.quitRedis();
    });

    describe('getUser', () => {
        it('pulls the user by username from redis', async () => {
            await redisSet(tetsUser.username, JSON.stringify(tetsUser));
            const result = await service.getUser(tetsUser.username);
            expect(result).to.eql(tetsUser);
        });
        it('returns undefined when there is no user');
    });

    describe('saveUser', () => {
        it('saves the user to redis', async () => {
            await service.saveUser(tetsUser);
            const checkUser = await redisGet(tetsUser.username);
            expect(JSON.parse(checkUser)).to.eql(tetsUser);
        });
    });
});
