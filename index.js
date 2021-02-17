const express = require('express');
const { logger } = require('./config/logger');

const app = express();

app.use(express.json());

/*
curl -X POST -H "Content-Type: application/json" -d '{"name": "juzuf"}' http://localhost:3001/login
*/

app.post('/login', (req, res) => {
    logger.debug(`Received a request ${JSON.stringify(req.body)}`);
    res.send({ token: 'xxx' });
});

const server = app.listen(3001, () => {
    logger.info('Service started');
});

module.exports = {
    server,
    app,
};
