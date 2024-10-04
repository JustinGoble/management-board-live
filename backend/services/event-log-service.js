const _ = require('lodash');
const serviceUtils = require('./service-utils');
const { knex } = require('../database').connect();
const logger = require('../logger')(__filename);

function mapItem(row) {
  return serviceUtils.toCamelCase(row);
}

async function getEventLogs(opts = {}) {
  _.defaults(opts, {
    page: 0,
    limit: 50,
  });

  const query = knex('event_logs');

  const countQuery = query.clone();

  const rows = await query
    .select('*')
    .orderBy('created_at', 'desc')
    .limit(opts.limit)
    .offset(opts.limit * opts.page);

  const [{ count }] = await countQuery.count();

  return {
    totalHits: parseInt(count),
    results: rows.map(mapItem),
  };
}

async function addLogEntry(logEntry) {
  logger.debug('Adding new log entry');
  const dbLogEntry = serviceUtils.toSnakeCase(logEntry);
  await knex('event_logs').insert(dbLogEntry);
}

module.exports = {
  addLogEntry,
  getEventLogs,
};
