const db = require('../../backend/database').connect();
const logger = require('../../backend/logger')(__filename);

const TEST_TOKEN_ADMIN = 'aaaaa-0000';
const TEST_DISCORD_ACCESS_TOKEN_ADMIN = 'test-access-token-admin';

const TEST_TOKEN_MEMBER = 'bbbbb-0000';
const TEST_DISCORD_ACCESS_TOKEN_MEMBER = 'test-access-token-member';

let userIndex = 0;

async function saveTestUser(permissions, token, access_token) {
  logger.info('Saving test user');

  userIndex++;

  const [user] = await db.knex('users')
    .insert({
      name: `Test#${userIndex}`,
      nickname: `TestUser${userIndex} nickname`,
      discord_id: `Test ID ${userIndex}`,
      permissions,
    })
    .returning('*');

  await db.knex('access_tokens')
    .insert({
      user_id: user.id,
      token,
      user_agent: 'test user agent',
    });

  await db.knex('discord_tokens')
    .insert({
      user_id: user.id,
      access_token,
      refresh_token: `test-refresh-token-${userIndex}`,
      expires_in: 604800,
    });

  logger.info(`Test user ${user.id} saved`);

  return {
    user,
  };
}

async function removeTestUser(user) {
  logger.info('Removing test user');

  await db.knex('discord_tokens')
    .where('access_token', TEST_DISCORD_ACCESS_TOKEN_ADMIN)
    .del();

  await db.knex('access_tokens')
    .where('token', TEST_TOKEN_ADMIN)
    .del();

  if (user) {
    await db.knex('users')
      .where('id', user.id)
      .del();
  }

  logger.info('Test user removed');
}

async function rollbackDatabase() {
  const version = await db.knex.migrate.currentVersion(db.config);
  if (version !== 'none') {
    logger.debug(`Rolling back db version ${version}`);
    await db.knex.migrate.rollback(db.config);
    await rollbackDatabase();
  } else {
    logger.info('Database rolled back');
  }
}

async function migrateDatabase() {
  await db.knex.migrate.latest(db.config);
  logger.info('Database migrated');
}

async function resetDatabase() {
  await rollbackDatabase();
  await migrateDatabase();
  await saveTestUser(
    'admin',
    TEST_TOKEN_ADMIN,
    TEST_DISCORD_ACCESS_TOKEN_ADMIN,
  );
  await saveTestUser(
    'member',
    TEST_TOKEN_MEMBER,
    TEST_DISCORD_ACCESS_TOKEN_MEMBER,
  );
}

async function clearEvents() {
  await db.knex('event_logs').del();
}

module.exports = {
  ...db,
  TEST_TOKEN_ADMIN,
  TEST_DISCORD_ACCESS_TOKEN_ADMIN,
  TEST_TOKEN_MEMBER,
  TEST_DISCORD_ACCESS_TOKEN_MEMBER,

  saveTestUser,
  removeTestUser,

  rollbackDatabase,
  migrateDatabase,
  resetDatabase,

  clearEvents,
};
