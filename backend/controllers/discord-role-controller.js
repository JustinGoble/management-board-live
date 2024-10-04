const logger = require('../logger')(__filename);
const discordRoleService = require('../services/discord-role-service');

async function getDiscordRoleList() {
  logger.silly('discordRoleController.getDiscordRoleList');

  return await discordRoleService.getDiscordRoleList();
}

module.exports = {
  getDiscordRoleList,
};
