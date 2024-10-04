const requestController = require('../../../../controllers/request-controller');
const authController = require('../../../../controllers/auth-controller');
const { wrapController } = require('../../../../controllers/controller-utils');

module.exports = function buildRouter(router) {
  router.get(
    '/:requestId',
    authController.createVerifier('member', 'management', 'industry', 'admin'),
    wrapController(requestController.getRequest),
  );

  router.get(
    '/',
    authController.createVerifier('member', 'management', 'industry', 'admin'),
    wrapController(requestController.getRequests),
  );

  router.post(
    '/',
    authController.createVerifier('member','management', 'admin'),
    wrapController(requestController.upsertRequest),
  );

  router.post(
    '/:requestId/validate',
    authController.createVerifier('management','admin'),
    wrapController(requestController.validateRequest),
  );

  router.post(
    '/:requestId/complete',
    authController.createVerifier( 'industry', 'management', 'admin'),
    wrapController(requestController.completeRequest),
  );

  router.post(
    '/:requestId/pick-up',
    authController.createVerifier('member', 'industry', 'management', 'admin'),
    wrapController(requestController.pickUpRequest),
  );

  router.post(
    '/:requestId/change-priority',
    authController.createVerifier('management','admin'),
    wrapController(requestController.changePriority),
  );

  router.delete(
    '/:requestId',
    authController.createVerifier('admin'),
    wrapController(requestController.deleteRequest),
  );

  router.get(
    '/:requestId/comments',
    authController.createVerifier('industry', 'admin', 'management'),
    wrapController(requestController.getRequestComments),
  );

  router.post(
    '/:requestId/comments',
    authController.createVerifier('industry', 'admin', 'management'),
    wrapController(requestController.postRequestComment),
  );

  return router;
};
