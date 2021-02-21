/* eslint-disable no-bitwise */
const express = require('express');
const basicAuth = require('express-basic-auth');
const { logger } = require('./config/logger');
const userService = require('./src/userService');

const app = express();

async function authorize(username, password, callback) {
    let userFromDB;
    try {
        userFromDB = await userService.getUser(username);
    } catch (e) {
        logger.error(`Basic authorization failed at calling the service with ${e.message}`);
        return callback(null, false); /* think it over: should we unauthorize on error? */
    }

    if (!userFromDB) {
        return callback(null, false);
    }

    if (basicAuth.safeCompare(password, userFromDB.password)) {
        return callback(null, true);
    }
    return callback(null, false);
}

app.use(express.json());
app.use(basicAuth({
    authorizer: authorize,
    authorizeAsync: true,
}));

/*
curl -X POST -H "Content-Type: application/json" -d '{"name": "juzuf"}' http://localhost:3001/login
*/

app.post('/login', (req, res) => {
    logger.debug(`Received a request ${JSON.stringify(req.body)}`);
    res.send({ token: 'xxx' });
});

app.post('/verify', (req, res) => {
    logger.debug(`Received a verification request for JWT ${req.header.authorization}`);
    res.send({ valid: true });
});

const server = app.listen(3001, () => {
    logger.info('Service started');
});

module.exports = {
    server,
    app,
    authorize,
    userService,
};
