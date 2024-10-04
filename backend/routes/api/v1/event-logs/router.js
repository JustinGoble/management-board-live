const eventLogController = require('../../../../controllers/event-log-controller');
const authController = require('../../../../controllers/auth-controller');
const { wrapController } = require('../../../../controllers/controller-utils');

module.exports = function buildRouter(router) {
  router.get(
    '/',
    authController.createVerifier('management', 'admin'),
    wrapController(eventLogController.getEventLogs),
  );

  return router;
};

