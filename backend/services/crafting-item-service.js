const _ = require('lodash');

const serviceUtils = require('./service-utils');
const { knex } = require('../database').connect();
const logger = require('../logger')(__filename);

function mapItem(row) {
  if (_.isString(row)) {
    return row;
  }

  if (row.data) {
    row.data = _.map(row.data, mapItem);
  }

  return serviceUtils.toCamelCase(row);
}

async function getCraftingItemList(searchQueryString) {
  const query = knex('crafting_items')
    .select('id', 'name', 'category_id')
    .orderBy('name', 'asc');

  if (searchQueryString) {
    query.where('name', 'ilike', `%${searchQueryString}%`);
  }

  const rows = await query;

  if (rows.length === 0) {
    return rows;
  }

  // Resolve the item tags
  const categories = await knex('crafting_item_categories')
    .select('id', 'tag', 'parent_id');

  const categoryMap = {};
  for (const category of categories) {
    categoryMap[category.id] = category;
  }

  for (const row of rows) {
    let categoryId = row.category_id;
    delete row.category_id;

    while (!row.tag) {
      const category = categoryMap[categoryId];
      row.tag = category.tag;
      categoryId = category.parent_id;

      if (!categoryId && !row.tag) {
        const str = JSON.stringify(row);
        throw new Error(`Unable to resolve a tag for crafting item ${str}`);
      }
    }
  }

  return rows;
}

function resolveTreeChildren(rootNode, craftingItems, categories) {
  const childrenItems = _.remove(
    craftingItems,
    ci => ci.category_id === rootNode.id,
  );

  const childrenCategories = _.remove(
    categories,
    c => c.parent_id === rootNode.id,
  );

  const data = [
    ...childrenItems.map(ci => ({ id: ci.id, name: ci.name })),
    ...childrenCategories.map(
      c => resolveTreeChildren(c, craftingItems, categories),
    ),
  ];

  return {
    id: rootNode.id,
    name: rootNode.name,
    tag: rootNode.tag,
    data,
  };
}

async function exportCraftingItems(opts = {}) {
  _.defaults(opts, {});

  const craftingItems = await knex('crafting_items').select('*');
  const categories = await knex('crafting_item_categories').select('*');

  const treeRoots = _.filter(categories, c => !c.parent_id);
  const resolvedRoots = treeRoots.map(
    tr => resolveTreeChildren(tr, craftingItems, categories),
  );

  return resolvedRoots.map(mapItem);
}

async function resolveItemsAndCategories(
  trx,
  entry,
  craftingItems,
  categories,
  parentId = null,
) {
  if (_.isString(entry) || _.isNil(entry.data)) {
    // Items can either be given as a string array or as item
    // objects under the `data` fields of cateogries.
    const baseItem = _.isString(entry)
      ? {
        name: entry,
        category_id: parentId,
      } : {
        id: entry.id,
        name: entry.name,
        category_id: parentId,
      };

    craftingItems.push(baseItem);
  } else {
    const category = {
      id: entry.id,
      name: entry.name,
      tag: entry.tag,
      parent_id: parentId,
    };

    // Some categories might not have IDs, save to the
    // database to ensure a valid ID value.
    const [dbCategory] = await trx('crafting_item_categories')
      .insert(category)
      .onConflict('id').merge()
      .returning('id');

    category.id = dbCategory;
    categories.push(category);

    for (const newEntry of entry.data) {
      await resolveItemsAndCategories(
        trx,
        newEntry,
        craftingItems,
        categories,
        category.id,
      );
    }
  }
}

async function importCraftingItemsProcess(data, trx) {
  logger.info('Importing a new crafting item list from JSON');

  const craftingItems = [];
  const categories = [];

  let dbItems = [];
  let delItems = [];
  let delCategories = [];

  for (const entry of data) {
    await resolveItemsAndCategories(trx, entry, craftingItems, categories);
  }

  if (craftingItems.length > 0) {
    dbItems = await trx('crafting_items')
      .insert(craftingItems)
      .onConflict('id').merge()
      .returning('id');
  }

  logger.info(`Upserted ${categories.length} categories and ${dbItems.length} items`);

  delItems = await trx('crafting_items')
    .whereNotIn('id', dbItems)
    .del()
    .returning('id');

  delCategories = await trx('crafting_item_categories')
    .whereNotIn('id', categories.map(c => c.id))
    .del()
    .returning('id');

  logger.info(`Removed ${delCategories.length} categories and ${delItems.length} items`);

  return {
    dbItems,
    categories,
    delItems,
    delCategories,
  };
}

async function importCraftingItems(data, trx) {
  let returnVals;
  if (trx) {
    returnVals = await importCraftingItemsProcess(data, trx);
  } else {
    await knex.transaction(async trx => {
      returnVals = await importCraftingItemsProcess(data, trx);
    });
  }

  const {
    dbItems,
    categories,
    delItems,
    delCategories,
  } = returnVals;

  return {
    upserted: {
      items: dbItems.length,
      categories: categories.length,
    },
    removed: {
      items: delItems.length,
      categories: delCategories.length,
    },
  };
}

module.exports = {
  getCraftingItemList,
  exportCraftingItems,
  importCraftingItemsProcess,
  importCraftingItems,
};
