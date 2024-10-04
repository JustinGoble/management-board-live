const shipController = require('../../../../controllers/ship-controller');
const authController = require('../../../../controllers/auth-controller');
const { wrapController } = require('../../../../controllers/controller-utils');

module.exports = function buildRouter(router) {
  router.get(
    '/list',
    authController.createVerifier('member', 'management','admin'),
    wrapController(shipController.getShipList),
  );

  router.get(
    '/:shipId',
    authController.createVerifier('member', 'management','admin'),
    wrapController(shipController.getShip),
  );

  router.get(
    '/',
    authController.createVerifier('member', 'management', 'admin'),
    wrapController(shipController.getShips),
  );

  router.post(
    '/',
    authController.createVerifier('management', 'admin'),
    wrapController(shipController.upsertShip),
  );

  router.delete(
    '/:shipId',
    authController.createVerifier('management', 'admin'),
    wrapController(shipController.deleteShip),
  );

  return router;
};
