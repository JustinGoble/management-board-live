const { knex } = require('../backend/database').connect();
const logger = require('../backend/logger')(__filename);

(async () => {
  logger.info('Demoting provided user to member...');
  try {
    await knex('users')
      .where('discord_id', '=', '128246837839790080')
      .update({ permissions: 'member' });
    logger.info('Defined user is now a member!');
  } catch (e) {
    logger.error(e.stack || e);
  }
  process.exit();
})();