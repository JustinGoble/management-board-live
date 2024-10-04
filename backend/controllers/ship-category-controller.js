const Joi = require('joi');
const logger = require('../logger')(__filename);
const controllerUtils = require('./controller-utils');
const shipCategoryService = require('../services/ship-category-service');
const commonSchemas = require('../schemas/common-schemas');
const shipCategorySchemas = require('../schemas/ship-category-schemas');

const LOGGING_TYPE = 'ship_category';

const shipCategoryMultiQuerySchema = Joi.object().keys({
  page: commonSchemas.incremental.optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});

const shipCategoryIdPathSchema = Joi.object().keys({
  shipCategoryId: commonSchemas.incremental,
});

async function getShipCategoryList() {
  logger.silly('shipCategoryController.getShipCategoryList');

  return await shipCategoryService.getShipCategoryList();
}

async function getShipCategories(req) {
  logger.silly('shipCategoryController.getShipCategories');

  const options = controllerUtils.validate(
    req.query,
    shipCategoryMultiQuerySchema,
  );

  return await shipCategoryService.getShipCategories(options);
}

async function getShipCategory(req) {
  logger.silly('shipCategoryController.getShipCategory');

  const { shipCategoryId } = controllerUtils.validate(
    req.params,
    shipCategoryIdPathSchema,
  );

  return await shipCategoryService.getShipCategory(shipCategoryId);
}

async function upsertShipCategory(req) {
  logger.silly('shipCategoryController.upsertShipCategory');

  const shipCategory = controllerUtils.validate(
    req.body,
    shipCategorySchemas.shipCategoryPushSchema,
  );

  await controllerUtils.logRequest(req, LOGGING_TYPE);
  return await shipCategoryService.upsertShipCategory(shipCategory);
}

async function deleteShipCategory(req) {
  logger.silly('shipCategoryController.deleteShipCategory');

  const { shipCategoryId } = controllerUtils.validate(
    req.params,
    shipCategoryIdPathSchema,
  );

  await controllerUtils.logRequest(req, LOGGING_TYPE);
  await shipCategoryService.deleteShipCategory(shipCategoryId);
}

module.exports = {
  getShipCategoryList,
  getShipCategories,
  getShipCategory,
  upsertShipCategory,
  deleteShipCategory,
};
