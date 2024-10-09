const envConfig = require('./config');
const logger = require('./logger')(__filename);

const config = {
  client: 'pg',
  connection: {
    connectionString: `${envConfig.DATABASE_URL}${envConfig.SSLMODE}`,
    ssl: {
      rejectUnauthorized: false,
    },
  },
  migrations: {
    tableName: 'migrations',
  },
  pool: {
    min: 1,
    max: 7,
  },
};

let knex = null;

function connect() {
  if (!knex) {
    logger.info('Initializing database client');
    knex = require('knex')(config);
  }

  logger.debug('Returning existing database client');

  return {
    knex,
    config,
  };
}

module.exports = {
  config,
  connect,
};
