const _ = require('lodash');
const logger = require('../logger')(__filename);
const { knex } = require('../database').connect();

async function getDiscordRoleList() {
  return await knex('discord_roles')
    .select('id', 'name', 'color')
    .orderBy('name', 'asc');
}

async function upsertBulkDiscordRoles(discordRoles) {
  const currentRoles = await knex('discord_roles').select();
  const currentRoleIds = currentRoles.map(r => r.id);

  // Add or update all fetched Discord roles
  for (const role of discordRoles) {
    if (_.includes(currentRoleIds, role.id)) {
      logger.debug(`Existing role: "${role.name}"`);
      await knex('discord_roles')
        .where('id', role.id)
        .update(role);
    } else {
      logger.info(`New role "${role.name}" (${role.id})`);
      await knex('discord_roles').insert(role);
    }
  }
}

module.exports = {
  getDiscordRoleList,
  upsertBulkDiscordRoles,
};
