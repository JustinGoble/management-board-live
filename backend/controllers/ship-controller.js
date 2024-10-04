const Joi = require('joi');
const logger = require('../logger')(__filename);
const controllerUtils = require('./controller-utils');
const shipService = require('../services/ship-service');
const commonSchemas = require('../schemas/common-schemas');
const shipSchemas = require('../schemas/ship-schemas');

const LOGGING_TYPE = 'ship';

const shipMultiQuerySchema = Joi.object().keys({
  page: commonSchemas.incremental.optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  sortField: Joi.string().optional(),
  sortOrder: Joi.any().valid('ascend', 'descend').optional(),
  search: Joi.string().allow('').optional(),
});

const shipIdPathSchema = Joi.object().keys({
  shipId: commonSchemas.incremental,
});

async function getShipList() {
  logger.silly('shipController.getShipList');

  return await shipService.getShipList();
}

async function getShips(req) {
  logger.silly('shipController.getShips');

  const options = controllerUtils.validate(
    req.query,
    shipMultiQuerySchema,
  );

  return await shipService.getShips(options);
}

async function getShip(req) {
  logger.silly('shipController.getShip');

  const { shipId } = controllerUtils.validate(
    req.params,
    shipIdPathSchema,
  );

  return await shipService.getShip(shipId);
}

async function upsertShip(req) {
  logger.silly('shipController.upsertShip');

  const ship = controllerUtils.validate(
    req.body,
    shipSchemas.shipPushSchema,
  );

  await controllerUtils.logRequest(req, LOGGING_TYPE);
  return await shipService.upsertShip(ship);
}

async function deleteShip(req) {
  logger.silly('shipController.deleteShip');

  const { shipId } = controllerUtils.validate(
    req.params,
    shipIdPathSchema,
  );

  await controllerUtils.logRequest(req, LOGGING_TYPE);
  await shipService.deleteShip(shipId);
}

module.exports = {
  getShipList,
  getShips,
  getShip,
  upsertShip,
  deleteShip,
};
