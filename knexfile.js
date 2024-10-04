const envConfig = require('./backend/config');
const dbConfig = require('./backend/database').config;
const logger = require('./backend/logger')(__filename);

const knexConfig = {
  development: dbConfig,
  test: dbConfig,
  production: dbConfig,
};

const env = envConfig.NODE_ENV;

if (!Object.prototype.hasOwnProperty.call(knexConfig, env)) {
  logger.error('Invalid NODE_ENV value', env);
}

module.exports = knexConfig;
