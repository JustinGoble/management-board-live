const _ = require('lodash');

const serviceUtils = require('./service-utils');
const { knex } = require('../database').connect();
const logger = require('../logger')(__filename);

const throwNotFound = (shipCategoryId) => {
  const error = new Error(`Ship category ${shipCategoryId} not found!`);
  error.status = 404;
  throw error;
};

function mapItem(row) {
  return serviceUtils.toCamelCase(row);
}

async function getShipCategoryList() {
  return await knex('ship_categories')
    .select('id', 'name')
    .orderBy('name', 'asc');
}

async function getShipCategories(opts = {}) {
  _.defaults(opts, {
    page: 0,
    limit: 50,
  });

  const [{ count }] = await knex('ship_categories').count();

  const query = knex('ship_categories')
    .orderBy('name', 'asc')
    .limit(opts.limit)
    .offset(opts.limit * opts.page);

  const rows = await query;
  return {
    totalHits: count,
    results: rows.map(mapItem),
  };
}

async function getShipCategory(shipCategoryId) {
  const [shipCategory] = await knex('ship_categories')
    .select('*')
    .where('id', shipCategoryId);

  if (!shipCategory) {
    throwNotFound(shipCategoryId);
  }

  return mapItem(shipCategory);
}

async function upsertShipCategory(shipCategory) {
  if (_.isNil(shipCategory.id)) {
    return addShipCategory(shipCategory);
  }
  return updateShipCategory(shipCategory);
}

async function addShipCategory(shipCategory) {
  logger.debug('Adding new ship category');
  const dbShipCategory = serviceUtils.toSnakeCase(shipCategory);

  const rows = await knex('ship_categories')
    .insert(dbShipCategory)
    .returning('*');

  return mapItem(rows[0]);
}

async function updateShipCategory(shipCategory) {
  logger.debug(`Updating ship category with ID ${shipCategory.id}`);
  const dbShipCategory = serviceUtils.toSnakeCase(shipCategory);

  const [updatedShipCategory] = await knex('ship_categories')
    .where('id', shipCategory.id)
    .update(dbShipCategory)
    .returning('*');

  if (!updatedShipCategory) {
    throwNotFound(shipCategory.id);
  }

  return mapItem(updatedShipCategory);
}

async function deleteShipCategory(shipCategoryId) {
  const [shipCategory] = await knex('ship_categories')
    .where('id', shipCategoryId)
    .del()
    .returning('*');

  if (!shipCategory) {
    throwNotFound(shipCategoryId);
  }
}

module.exports = {
  getShipCategoryList,
  getShipCategories,
  getShipCategory,
  upsertShipCategory,
  addShipCategory,
  updateShipCategory,
  deleteShipCategory,
};
