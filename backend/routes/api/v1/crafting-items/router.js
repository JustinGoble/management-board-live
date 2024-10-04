const craftingItemController = require('../../../../controllers/crafting-item-controller');
const authController = require('../../../../controllers/auth-controller');
const { wrapController } = require('../../../../controllers/controller-utils');

module.exports = function buildRouter(router) {
  router.get(
    '/list',
    authController.createVerifier('member', 'management', 'industry', 'admin'),
    wrapController(craftingItemController.getCraftingItemList),
  );

  router.get(
    '/export',
    authController.createVerifier('member', 'management', 'industry', 'admin'),
    wrapController(craftingItemController.exportCraftingItems),
  );

  router.post(
    '/import',
    authController.createVerifier('admin'),
    wrapController(craftingItemController.importCraftingItems),
  );

  return router;
};
