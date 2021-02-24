const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { logger } = require('./config/logger');
const userService = require('./src/userService');

const { JWT_KEY } = process.env;
if (!JWT_KEY) {
    logger.error('Fatal Error! JWT_KEY not defined in env variables. Shutting down.');
    process.exit(1);
}

const PORT = process.env.EVOLOGIN_PORT ? process.env.EVOLOGIN_PORT : 3001;

const app = express();

async function myBasicAuth(req, res, next) {
    if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
        return res.status(401).send();
    }

    const base64Credentials = req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    let userFromDB;
    try {
        userFromDB = await userService.getUser(username);
    } catch (e) {
        logger.error(`Basic authorization failed at calling the service with ${e.message}`);
        return res.status(400).send();
    }

    if (!userFromDB) {
        logger.warn(`Username: ${username} not found in database.`);
        return res.status(401).send();
    }

    const compareResult = await bcrypt.compare(password, userFromDB.password);

    if (compareResult) {
        req.user = userFromDB;
        return next();
    }
    return res.status(401).send();
}

function verifyJWT(req, res, next) {
    const header = req.headers.authorization;
    if (!header) {
        return res.status(401).send();
    }
    const token = header.split(' ')[1]; /* there should be no space in token */
    jwt.verify(token, JWT_KEY, (err, data) => {
        if (err) {
            return res.status(403).send();
        }
        req.jwtAuthorization = data;
        return next();
    });
}

app.use(express.json());

/*
curl -X POST -H "Content-Type: application/json" -d '{"name": "juzuf"}' http://localhost:3001/login

curl -X POST -H 'Accept:application/json' -H 'Authorization:Basic BASE64_string' -i http://localhost:3000/login

-H 'Authorization:Basic BASE64_string'
*/

app.post('/login', myBasicAuth, (req, res) => {
    logger.debug(`Received a request to login from user ${req.user.username}`);
    const jwtToken = jwt.sign(req.user, JWT_KEY, {
        algorithm: 'HS256',
    });
    logger.debug(`Returning JWT: ${jwtToken}`);
    res.send({ token: jwtToken });
});

app.post('/verify', (req, res) => {
    logger.debug(`Received a verification request for JWT ${req.header.authorization}`);
    res.send({ valid: true });
});

const server = app.listen(PORT, () => {
    logger.info(`Service started on port: ${PORT}`);
});

module.exports = {
    server,
    app,
    userService,
};
