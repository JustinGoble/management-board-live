const Joi = require('joi');
const logger = require('../logger')(__filename);
const controllerUtils = require('./controller-utils');
const craftingItemService = require('../services/crafting-item-service');
const craftingItemSchemas = require('../schemas/crafting-item-schemas');

const LOGGING_TYPE = 'craftingItem';

const craftingItemListQuerySchema = Joi.object().keys({
  query: Joi.string().min(2).max(50).optional(),
});

async function getCraftingItemList(req) {
  logger.silly('craftingItemController.getGameList');

  const { query } = controllerUtils.validate(
    req.query,
    craftingItemListQuerySchema,
  );

  return await craftingItemService.getCraftingItemList(query);
}

async function exportCraftingItems() {
  logger.silly('craftingItemController.exportCraftingItems');

  return await craftingItemService.exportCraftingItems();
}

async function importCraftingItems(req) {
  logger.silly('craftingItemController.importCraftingItems');

  const data = controllerUtils.validate(
    req.body,
    Joi.array().items(craftingItemSchemas.craftingItemCategorySchema),
  );

  await controllerUtils.logRequest(req, LOGGING_TYPE);
  return await craftingItemService.importCraftingItems(data);
}

module.exports = {
  getCraftingItemList,
  exportCraftingItems,
  importCraftingItems,
};
