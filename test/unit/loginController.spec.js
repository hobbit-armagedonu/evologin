const { expect } = require('chai');
const sinon = require('sinon');
const supertest = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userService = require('../../src/userService');
const controller = require('../../index');

const verify = (tok, key) => new Promise((resolve, reject) => jwt.verify(tok, key, (err, res) => {
    if (err) {
        return reject(err);
    }
    return resolve(res);
}));

describe('login controller (index.js)', () => {
    let testUser;
    let hashedUser;

    after(() => {
        controller.server.close();
        controller.userService.quitRedis();
        userService.quitRedis();
    });

    beforeEach(async () => {
        testUser = {
            username: 'john',
            password: '0nanakoFFan@',
        };

        const pwd = await bcrypt.hash(testUser.password, 3);

        hashedUser = {
            username: 'john',
            password: pwd,
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('/login', () => {
        it('parses the basic authentication and calls service with username and compares passwords', async () => {
            const serviceStub = sinon.stub(userService, 'getUser').resolves(hashedUser);
            const cryptoSpy = sinon.spy(bcrypt, 'compare');
            const base64Credentials = Buffer.from(`${testUser.username}:${testUser.password}`).toString('base64');
            await supertest(controller.app)
                .post('/login')
                .set('Authorization', `Basic ${base64Credentials}`)
                .expect(200);
            expect(serviceStub.firstCall.args).to.eql([hashedUser.username]);
            expect(cryptoSpy.firstCall.args).to.eql([testUser.password, hashedUser.password]);
        });
        it('returns 200 with a jwt', async () => {
            sinon.stub(userService, 'getUser').resolves(hashedUser);
            const base64Credentials = Buffer.from(`${testUser.username}:${testUser.password}`).toString('base64');
            const response = await supertest(controller.app)
                .post('/login')
                .set('Authorization', `Basic ${base64Credentials}`)
                .expect(200);
            const encodedUser = await verify(response.body.token, process.env.JWT_KEY);
            expect(encodedUser.username).to.eql(hashedUser.username);
        });
        it('returns 403 when no user', async () => {
            sinon.stub(userService, 'getUser').resolves(undefined);
            const base64Credentials = Buffer.from(`${testUser.username}:${testUser.password}`).toString('base64');
            await supertest(controller.app)
                .post('/login')
                .set('Authorization', `Basic ${base64Credentials}`)
                .expect(401);
        });
        it('returns 403 when cant parse auth header', async () => {
            sinon.stub(userService, 'getUser').resolves(hashedUser);
            const base64Credentials = Buffer.from(`${testUser.username}:${testUser.password}`).toString('base64');
            await supertest(controller.app)
                .post('/login')
                .set('Authorization', `Complex ${base64Credentials}`)
                .expect(401);
        });
        it('returns 403 when password does not match', async () => {
            const otherPassword = await bcrypt.hash('0rkiZPo2nani@', 8);
            hashedUser = {
                username: 'john',
                password: otherPassword,
            };

            sinon.stub(userService, 'getUser').resolves(hashedUser);
            const base64Credentials = Buffer.from(`${testUser.username}:${testUser.password}`).toString('base64');
            await supertest(controller.app)
                .post('/login')
                .set('Authorization', `Basic ${base64Credentials}xxx`)
                .expect(401);
        });
    });
});
