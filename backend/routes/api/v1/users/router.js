const userController = require('../../../../controllers/user-controller');
const authController = require('../../../../controllers/auth-controller');
const { wrapController } = require('../../../../controllers/controller-utils');

module.exports = function buildRouter(router) {
  router.get(
    '/@me',
    authController.createVerifier('all'),
    wrapController(userController.getCurrentUser),
  );

  router.get(
    '/list',
    authController.createVerifier('all'),
    wrapController(userController.getUserList),
  );

  router.get(
    '/:userId',
    authController.createVerifier('member', 'management', 'admin'),
    wrapController(userController.getUser),
  );

  router.get(
    '/',
    authController.createVerifier('management', 'admin'),
    wrapController(userController.getUsers),
  );

  router.patch(
    '/:userId',
    authController.createVerifier('member', 'management', 'admin'),
    wrapController(userController.updateUser),
  );

  router.delete(
    '/:userId',
    authController.createVerifier('member', 'management', 'admin'),
    wrapController(userController.deleteUser),
  );

  return router;
};
