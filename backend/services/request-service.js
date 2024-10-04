// @ts-check

const _ = require('lodash');

const serviceUtils = require('./service-utils');
const { knex } = require('../database').connect();
const logger = require('../logger')(__filename);

const REQUEST_STATE = {
  CREATED: 'created',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
  PICKED_UP: 'picked_up',
  OWN: 'own',
};

const throwNotFound = (requestId) => {
  const error = new Error(`Request ${requestId} not found!`);
  // @ts-ignore
  error.status = 404;
  throw error;
};

function mapItem(row) {
  row.tags = _.compact(_.split(row.tags, ' '));

  return serviceUtils.toCamelCase(row);
}

function mapItemToDatabase(request) {
  const dbRequest = serviceUtils.toSnakeCase(request);

  if (dbRequest.tags) {
    dbRequest.tags = _.join(request.tags, ' ');
  }

  dbRequest.content = JSON.stringify(dbRequest.content);
  return dbRequest;
}

function addStateConditions(query, states, userId) {
  if (_.includes(states, REQUEST_STATE.CREATED)) {
    query = query.orWhere({
      validated_at: null,
    });
  }
  if (_.includes(states, REQUEST_STATE.APPROVED)) {
    query = query.orWhere({
      approved: true,
      completed_at: null,
    });
  }
  if (_.includes(states, REQUEST_STATE.REJECTED)) {
    query = query.orWhere({
      approved: false,
      completed_at: null,
    });
  }
  if (_.includes(states, REQUEST_STATE.COMPLETED)) {
    query = query.orWhere((builder) =>
      builder
        .whereNotNull('completed_at')
        .andWhere('picked_up_at', null),
    );
  }
  if (_.includes(states, REQUEST_STATE.PICKED_UP)) {
    query = query.orWhereNotNull('picked_up_at');
  }
  if (_.includes(states, REQUEST_STATE.OWN)) {
    query = query.orWhere('created_by', userId);
  }
  return query;
}

async function getRequests(opts = {}) {
  _.defaults(opts, {
    page: 0,
    limit: 50,
    userId: null,
    states: [
      REQUEST_STATE.CREATED,
      REQUEST_STATE.APPROVED,
      REQUEST_STATE.REJECTED,
      REQUEST_STATE.COMPLETED,
      REQUEST_STATE.PICKED_UP,
    ],
  });

  let query = knex('requests');

  query = addStateConditions(query, opts.states, opts.userId);

  const [{ count }] = await query.clone().count();

  const rows = await query
    .select(
      'id',
      'details',
      'created_by',
      'created_at',
      'validated_by',
      'validated_at',
      'approved',
      'completed_by',
      'completed_at',
      'picked_up_at',
      'tags',
      'type',
      'priority',
    )
    .orderBy('created_at', 'desc')
    .limit(opts.limit)
    .offset(opts.limit * opts.page);

  return {
    totalHits: parseInt(count),
    results: rows.map(mapItem),
  };
}

async function getMemberOnlyRequests(opts = {}) {
  _.defaults(opts, {
    page: 0,
    limit: 50,
    userId: null,
    states: [
      REQUEST_STATE.CREATED,
      REQUEST_STATE.APPROVED,
      REQUEST_STATE.REJECTED,
      REQUEST_STATE.COMPLETED,
      REQUEST_STATE.PICKED_UP,
    ],
  });

  let query = knex('requests');
  query = query.where('created_by', opts.userId);
  query = query.where(wb => addStateConditions(wb, opts.states, opts.userId));

  const [{ count }] = await query.clone().count();

  const rowsPromise = query
    .select(
      'id',
      'details',
      'created_by',
      'created_at',
      'validated_by',
      'validated_at',
      'approved',
      'completed_by',
      'completed_at',
      'picked_up_at',
      'tags',
      'type',
      'priority',
    )
    .orderBy('created_at', 'desc')
    .limit(opts.limit)
    .offset(opts.limit * opts.page);

  const rows = await rowsPromise;
  logger.warn(rowsPromise.toString());

  return {
    totalHits: parseInt(count),
    results: rows.map(mapItem),
  };
}

async function getRequest(requestId) {
  const [request] = await knex('requests')
    .select('*')
    .where('requests.id', requestId);

  if (!request) {
    throwNotFound(requestId);
  }

  return mapItem(request);
}

async function upsertRequest(request) {
  if (_.isNil(request.id)) {
    return addRequest(request);
  }
  return updateRequest(request);
}

async function addRequest(request) {
  logger.debug('Adding new request');
  addTags(request);
  const dbRequest = mapItemToDatabase(request);
  const rows = await knex('requests')
    .insert(dbRequest)
    .returning('*');

  return mapItem(rows[0]);
}

function addTags(request) {
  logger.debug('Adding tags to request');
  const { content } = request;
  const tagsArray = request.tags || [];
  for (const item of content) {
    if (item.tag === 'industry' && !_.includes(tagsArray, 'industry')) {
      tagsArray.push('industry');
    }

    if (item.tag === 'navy' && !_.includes(tagsArray, 'navy')) {
      tagsArray.push('navy');
    }

    if (item.tag === 'schematic' && !_.includes(tagsArray, 'schematic')) {
      tagsArray.push('schematic');
    }

    if (item.tag === 'ship' && !_.includes(tagsArray, 'ship')) {
      tagsArray.push('ship');
    }

    if (item.tag === 'voxel' && !_.includes(tagsArray, 'voxel')) {
      tagsArray.push('voxel');
    }
  }
  request.tags = tagsArray;
}

async function updateRequest(request) {
  logger.debug(`Updating request with ID ${request.id}`);
  const dbRequest = mapItemToDatabase(request);

  const [updatedRequest] = await knex('requests')
    .where('id', request.id)
    .update(dbRequest)
    .returning('*');

  if (!updatedRequest) {
    throwNotFound(request.id);
  }
  return mapItem(updatedRequest);
}

async function deleteRequest(requestId) {
  const [request] = await knex('requests')
    .where('id', requestId)
    .del()
    .returning('*');

  if (!request) {
    throwNotFound(requestId);
  }
}

module.exports = {
  REQUEST_STATE,
  getRequest,
  getRequests,
  getMemberOnlyRequests,
  upsertRequest,
  addRequest,
  updateRequest,
  deleteRequest,
};
