const { knex } = require('../backend/database').connect();
const logger = require('../backend/logger')(__filename);

(async () => {
  logger.info('Promoting provided user to admin...');
  try {
    await knex('users')
      .where('discord_id', '=', '128246837839790080')
      .update({ permissions: 'member admin' });
    logger.info('Defined member is now an admin!');
  } catch (e) {
    logger.error(e.stack || e);
  }
  process.exit();
})();