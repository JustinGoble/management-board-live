const { knex } = require('../backend/database').connect();
const logger = require('../backend/logger')(__filename);

(async () => {
  logger.info('Promoting provided user to manager...');
  try {
    await knex('users')
      .where('discord_id', '=', '128246837839790080')
      .update({ permissions: 'management' });
    logger.info('Defined member is now a manager!');
  } catch (e) {
    logger.error(e.stack || e);
  }
  process.exit();
})();