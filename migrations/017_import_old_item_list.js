const itemList = require('./data/new-item-db.json');
const craftingItemService = require('../backend/services/crafting-item-service');

exports.up = async (knex) => {
  await craftingItemService.importCraftingItemsProcess(itemList, knex);
};

exports.down = async (knex) => {
  await knex('crafting_items').del();
};
