const applicationController = require('../../../../controllers/application-controller');
const authController = require('../../../../controllers/auth-controller');
const { wrapController } = require('../../../../controllers/controller-utils');

module.exports = function buildRouter(router) {
  router.get(
    '/:applicationId',
    authController.createVerifier('applicant', 'management', 'admin'),
    wrapController(applicationController.getApplication),
  );

  router.get(
    '/',
    authController.createVerifier('applicant', 'management', 'admin'),
    wrapController(applicationController.getApplications),
  );

  router.post(
    '/',
    authController.createVerifier('admin'),
    wrapController(applicationController.upsertApplication),
  );

  router.delete(
    '/:applicationId',
    authController.createVerifier('admin'),
    wrapController(applicationController.deleteApplication),
  );

  // router.review(
  //   '/:applicationId',
  //   authController.createVerifier('admin', 'management'),
  //   wrapController(applicationController.reviewApplication),
  // );

  return router;
};
