const _ = require('lodash');

const serviceUtils = require('./service-utils');
const { knex } = require('../database').connect();
const logger = require('../logger')(__filename);

const throwNotFound = (applicationId) => {
  const error = new Error(`Application ${applicationId} not found!`);
  error.status = 404;
  throw error;
};

function mapItem(row) {
  return serviceUtils.toCamelCase(row);
}

async function getApplicationList() {
  return await knex('applications')
    .select('id', 'created_at')
    .orderBy('created_at', 'asc');
}

async function getApplications(opts = {}) {
  _.defaults(opts, {
    page: 0,
    limit: 50,
  });
  const [{ count }] = await knex('applications').count();
  const query = knex('applications')
    .orderBy('created_at', 'asc')
    .limit(opts.limit)
    .offset(opts.limit * opts.page);

  const rows = await query;
  return {
    totalHits: count,
    results: rows.map(mapItem),
  };
}

async function getApplication(applicationId) {
  const [application] = await knex('applications')
    .select('*')
    .where('applications.id', applicationId);

  if (!application) {
    throwNotFound(applicationId);
  }

  return mapItem(application);
}

async function upsertApplication(application) {
  if (_.isNil(application.id)) {
    return addApplication(application);
  }
  return updateApplication(application);
}

async function addApplication(application) {
  logger.debug('Adding new application');
  const dbApplication = serviceUtils.toSnakeCase(application);

  const rows = await knex('applications')
    .insert(dbApplication)
    .returning('*');

  return mapItem(rows[0]);
}

async function updateApplication(application) {
  logger.debug(`Updating application with ID ${application.id}`);
  const dbApplication = serviceUtils.toSnakeCase(application);

  const [updatedApplication] = await knex('applications')
    .where('id', application.id)
    .update(dbApplication)
    .returning('*');

  if (!updatedApplication) {
    throwNotFound(application.id);
  }

  return mapItem(updatedApplication);
}

async function deleteApplication(applicationId) {
  const [application] = await knex('applications')
    .where('id', applicationId)
    .del()
    .returning('*');

  if (!application) {
    throwNotFound(applicationId);
  }
}

module.exports = {
  getApplicationList,
  getApplications,
  getApplication,
  upsertApplication,
  addApplication,
  updateApplication,
  deleteApplication,
};
