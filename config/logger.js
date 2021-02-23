const winston = require('winston');

const {
    combine,
    timestamp,
    label,
    simple,
} = winston.format;

const LOG_LEVEL = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
    silly: 6,
};

let actualLogLevel;
if (process.env.LOG_LEVEL && LOG_LEVEL[process.env.LOG_LEVEL.toLowerCase()] >= 0) {
    actualLogLevel = process.env.LOG_LEVEL.toLowerCase();
} else {
    actualLogLevel = 'info';
}

const actualTransports = [];

if (process.env.LOG_FILE) {
    const fileLog = new winston.transports.File({ filename: process.env.LOG_FILE });
    actualTransports.push(fileLog);
}

if (!actualTransports.length || process.env.LOG_CONSOLE) {
    actualTransports.push(new winston.transports.Console());
}

const logger = winston.createLogger({
    level: actualLogLevel,
    format: combine(
        timestamp(),
        label({ service: 'evologin' }),
        simple(),
    ),
    transports: actualTransports,
});

module.exports = {
    logger,
};
