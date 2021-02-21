const winston = require('winston');

const {
    combine,
    timestamp,
    label,
    simple,
} = winston.format;

const logger = winston.createLogger({
    level: 'debug',
    format: combine(
        timestamp(),
        label({ service: 'evologin' }),
        simple(),
    ),
    transports: [
        new winston.transports.File({ filename: 'logs/evologin.log' }),
        new winston.transports.Console(),
    ],
});

module.exports = {
    logger,
};
