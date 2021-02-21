const { expect } = require('chai');
const sinon = require('sinon');
const bcrypt = require('bcryptjs');
const userService = require('../../src/userService');
const controller = require('../../index');

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

    describe('authorize', () => {
        it('calls-back true when username & password are ok', async () => {
            sinon.stub(userService, 'getUser').resolves(hashedUser);
            return controller.authorize(testUser.username, testUser.password, (err, data) => {
                expect(data).to.be.equal(true);
            });
        });
        it('calls-back false when user does not exist', async () => {
            sinon.stub(userService, 'getUser').resolves(undefined);
            return controller.authorize(testUser.username, testUser.password, (err, data) => {
                expect(data).to.equal(false);
            });
        });
        it('calls-back false when pwd does not match', async () => {
            const otherPassword = await bcrypt.hash('0rkiZPo2nani@', 8);
            hashedUser = {
                username: 'john',
                password: otherPassword,
            };
            sinon.stub(userService, 'getUser').resolves(hashedUser);
            return controller.authorize(testUser.username, testUser.password, (err, data) => {
                expect(data).to.equal(false);
            });
        });
        it('calls-back false if password is not encrypted', async () => {
            sinon.stub(userService, 'getUser').resolves(testUser);
            return controller.authorize(testUser.username, testUser.password, (err, data) => {
                expect(data).to.equal(false);
            });
        });
    });
});
