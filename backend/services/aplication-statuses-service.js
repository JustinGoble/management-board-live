const serviceUtils = require('./service-utils');
const { knex } = require('../database').connect();
const logger = require('../logger')(__filename);

function mapItem(row) {
  return serviceUtils.toCamelCase(row);
}

async function importApplicationStatus(applicationStatus, knexTransaction = knex) {
  logger.debug('Adding new application status', applicationStatus);

  const dbItem = serviceUtils.toSnakeCase(applicationStatus);

  const rows = await knexTransaction('application_statuses')
    .insert({
      ...dbItem,
    })
    .returning('*');

  return mapItem(rows[0]);
}

module.exports = {
  importApplicationStatus,
};
