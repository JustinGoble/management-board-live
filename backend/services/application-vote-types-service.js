const serviceUtils = require('./service-utils');
const knex = require('knex');
const logger = require('../logger')(__filename);

function mapItem(row) {
  return serviceUtils.toCamelCase(row);
}

async function importApplicationVote(voteType, knexTransaction = knex) {
  logger.debug('Adding new application status', voteType);

  const dbItem = serviceUtils.toSnakeCase(voteType);

  const rows = await knexTransaction('application_vote_types')
    .insert({
      ...dbItem,
    })
    .returning('*');

  return mapItem(rows[0]);
}

module.exports = {
  importApplicationVote,
};
