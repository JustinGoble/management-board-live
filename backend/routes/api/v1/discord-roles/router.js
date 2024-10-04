const discordRoleController = require('../../../../controllers/discord-role-controller');
const authController = require('../../../../controllers/auth-controller');
const { wrapController } = require('../../../../controllers/controller-utils');

module.exports = function buildRouter(router) {
  router.get(
    '/list',
    authController.createVerifier('all'),
    wrapController(discordRoleController.getDiscordRoleList),
  );

  return router;
};
