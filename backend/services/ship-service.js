const _ = require('lodash');

const serviceUtils = require('./service-utils');
const { knex } = require('../database').connect();
const logger = require('../logger')(__filename);

const throwNotFound = (shipId) => {
  const error = new Error(`Ship ${shipId} not found!`);
  error.status = 404;
  throw error;
};

function mapToDb(ship) {
  const dbShip = serviceUtils.toSnakeCase(ship);

  dbShip.empty_weight_tons = _.ceil(dbShip.empty_weight_tons) || null;
  dbShip.max_cargo_tons = _.ceil(dbShip.max_cargo_tons) || null;
  dbShip.max_weight_tons = _.ceil(dbShip.max_weight_tons) || null;

  return dbShip;
}

function mapItem(dbShip) {
  const ship = serviceUtils.toCamelCase(dbShip);

  ship.maxVelocityKMPerH = parseFloat(ship.maxVelocityKmPerH);
  delete ship.maxVelocityKmPerH;

  ship.atmoThrustG = parseFloat(ship.atmoThrustG);
  ship.atmoBrakingG = parseFloat(ship.atmoBrakingG);
  ship.spaceThrustG = parseFloat(ship.spaceThrustG);
  ship.spaceBrakingG = parseFloat(ship.spaceBrakingG);

  return ship;
}

async function getShipList() {
  const rows = await knex('ships')
    .select('id', 'name', 'category_id')
    .orderBy('name', 'asc');

  return rows.map(serviceUtils.toCamelCase);
}

async function getShips(opts = {}) {
  _.defaults(opts, {
    page: 0,
    limit: 50,
    sortField: 'name',
    sortOrder: 'asc',
    search: undefined,
  });

  let query = knex('ships');

  if (opts.search) {
    query = query.whereRaw("name ILIKE '%' || ? || '%'", [opts.search]);
  }

  const countQuery = query.clone();

  const orderMap = { ascend: 'asc', descend: 'desc' };

  const rows = await query
    .select()
    .orderBy(_.snakeCase(opts.sortField), orderMap[opts.sortOrder])
    .orderBy('id', 'asc')
    .limit(opts.limit)
    .offset(opts.limit * opts.page);

  const [{ count }] = await countQuery.count();
  return {
    totalHits: parseInt(count),
    results: rows.map(mapItem),
  };
}

async function getShip(shipId) {
  const [ship] = await knex('ships')
    .select('*')
    .where('ships.id', shipId);

  if (!ship) {
    throwNotFound(shipId);
  }

  return mapItem(ship);
}

async function upsertShip(ship) {
  if (_.isNil(ship.id)) {
    return addShip(ship);
  }
  return updateShip(ship);
}

async function addShip(ship) {
  logger.debug('Adding new ship');
  const dbShip = mapToDb(ship);

  const rows = await knex('ships')
    .insert(dbShip)
    .returning('*');

  return mapItem(rows[0]);
}

async function updateShip(ship) {
  logger.debug(`Updating ship with ID ${ship.id}`);
  const dbShip = mapToDb(ship);

  const [updatedShip] = await knex('ships')
    .where('id', ship.id)
    .update(dbShip)
    .returning('*');

  if (!updatedShip) {
    throwNotFound(ship.id);
  }

  return mapItem(updatedShip);
}

async function deleteShip(shipId) {
  const [ship] = await knex('ships')
    .where('id', shipId)
    .del()
    .returning('*');

  if (!ship) {
    throwNotFound(shipId);
  }
}

module.exports = {
  getShipList,
  getShips,
  getShip,
  upsertShip,
  addShip,
  updateShip,
  deleteShip,
};
