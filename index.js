const express = require('express');
const basicAuth = require('express-basic-auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { logger } = require('./config/logger');
const userService = require('./src/userService');

const jwtSecret = 'temporalSecret';

const app = express();

async function authorize(username, password, callback) {
    let userFromDB;
    try {
        userFromDB = await userService.getUser(username);
    } catch (e) {
        logger.error(`Basic authorization failed at calling the service with ${e.message}`);
        return callback(null, false); /* TODO: think it over: should we unauthorize on error? */
    }

    if (!userFromDB) {
        return callback(null, false);
    }

    const compareResult = await bcrypt.compare(password, userFromDB.password);

    if (compareResult) {
        return callback(null, true);
    }
    return callback(null, false);
}

function verifyJWT(req, res, next) {
    const header = req.headers.authorization;
    if (!header) {
        return res.status(401).send();
    }
    const token = header.split(' ')[1]; /* there should be no space in token */
    jwt.verify(token, jwtSecret, (err, data) => {
        if (err) {
            return res.status(403).send();
        }
        req.jwtAuthorization = data;
        return next();
    });
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
    logger.debug(`Received a request to login from user ${req.auth.user}`);
    const jwtToken = jwt.sign(req.auth.user, jwtSecret, {
        algorithm: 'HS256',
    });
    logger.debug(`Returning JWT: ${jwtToken}`);
    res.send({ token: jwtToken });
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
