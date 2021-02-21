const { expect } = require('chai');
const sinon = require('sinon');
const userService = require('../../src/userService');
const controller = require('../../index');

describe('login controller (index.js)', () => {
    let testUser;

    after(() => {
        controller.server.close();
        controller.userService.quitRedis();
        userService.quitRedis();
    });

    beforeEach(() => {
        testUser = {
            username: 'john',
            password: '0nanakoFFan@',
        };
    });

    describe('authorize', () => {
        it('calls-back true when username & password are ok', async () => {
            sinon.stub(userService, 'getUser').resolves(testUser);
            return controller.authorize(testUser.username, testUser.password, (err, data) => {
                expect(data).to.be.equal(true);
            });
        });
        it('calls-back false when user does not exist');
        it('calls-back false when pwd does not match');
        it('calls-back false if password is not encrypted');
    });
});
