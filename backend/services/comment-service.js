// @ts-check

const _ = require('lodash');

const serviceUtils = require('./service-utils');
const { knex } = require('../database').connect();
const logger = require('../logger')(__filename);

function mapItemToDatabase(request) {
  return serviceUtils.toSnakeCase(request);
}

async function getRequestComments(opts = {}) {
  _.defaults(opts, {
    page: 0,
    limit: 10,
    requestId: null,
  });

  const [{ count }] = await knex('request_comments')
    .where('request_id', opts.requestId).count();

  const rows = await knex('request_comments')
    .select(
      'id',
      'text',
      'user_id',
      'created_at',
    )
    .where('request_id', opts.requestId)
    .orderBy('created_at', 'desc')
    .limit(opts.limit)
    .offset(opts.limit * opts.page);

  return {
    totalHits: parseInt(count),
    results: rows.map(mapItem),
  };
}

async function addRequestComment(request) {
  logger.debug('Adding new comment');

  const dbRequest = mapItemToDatabase(request);

  const rows = await knex('request_comments')
    .insert(dbRequest)
    .returning('*');

  return mapItem(rows[0]);
}

function mapItem(row) {
  return serviceUtils.toCamelCase(row);
}

module.exports = {
  getRequestComments,
  addRequestComment,
};
