const { wrapController } = require('../../../../controllers/controller-utils');
const authController = require('../../../../controllers/auth-controller');

module.exports = function buildRouter(router) {
  router.get(
    '/login',
    wrapController(authController.login),
  );

  router.get(
    '/callback',
    wrapController(authController.callback),
  );

  router.get(
    '/logout',
    authController.createVerifier('all'),
    wrapController(authController.logout),
  );

  return router;
};
