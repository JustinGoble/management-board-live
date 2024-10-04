const shipCategoryController = require('../../../../controllers/ship-category-controller');
const authController = require('../../../../controllers/auth-controller');
const { wrapController } = require('../../../../controllers/controller-utils');

module.exports = function buildRouter(router) {
  router.get(
    '/list',
    authController.createVerifier('member','management', 'admin'),
    wrapController(shipCategoryController.getShipCategoryList),
  );

  router.get(
    '/:shipCategoryId',
    authController.createVerifier('member','management', 'admin'),
    wrapController(shipCategoryController.getShipCategory),
  );

  router.get(
    '/',
    authController.createVerifier('member','management', 'admin'),
    wrapController(shipCategoryController.getShipCategories),
  );

  router.post(
    '/',
    authController.createVerifier('management', 'admin'),
    wrapController(shipCategoryController.upsertShipCategory),
  );

  router.delete(
    '/:shipCategoryId',
    authController.createVerifier('management', 'admin'),
    wrapController(shipCategoryController.deleteShipCategory),
  );

  return router;
};
