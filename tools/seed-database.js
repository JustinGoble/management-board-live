/* eslint-disable no-unused-vars */

const _ = require('lodash');
const App = require('../backend/app');
const { knex } = require('../backend/database').connect();
const logger = require('../backend/logger')(__filename);
const mocks = require('../tests/utils/mocks');
const database = require('../tests/utils/database');
const { createToolkit } = require('../tests/utils/toolkit');

(async () => {
  logger.info('Starting backend process...');
  const app = new App();
  const toolkit = createToolkit(app);
  await app.startAsync(6000);

  // Test user data
  let user = null;

  try {
    logger.info('Creating temporary login token...');
    await database.removeTestUser(); // Remove previous test users just in case they exist
    ({ user } = await database.saveTestUser(
      'admin',
      database.TEST_TOKEN_ADMIN,
      database.TEST_DISCORD_ACCESS_TOKEN_ADMIN,
    ));

    logger.info('Inserting branches...');
    const branch1 = await toolkit.upsertBranchProc(mocks.generateBranch());
    const branch2 = await toolkit.upsertBranchProc(mocks.generateBranch());
    const branch3 = await toolkit.upsertBranchProc(mocks.generateBranch());

    logger.info('Inserting divisions...');
    const division1 = await toolkit.upsertDivisionProc(mocks.generateDivision(branch1.id));
    const division2 = await toolkit.upsertDivisionProc(mocks.generateDivision(branch1.id));
    const division3 = await toolkit.upsertDivisionProc(mocks.generateDivision(branch2.id));

    logger.info('Inserting users...');
    const users = await knex('users')
      .insert(
        _.map([
          mocks.generateUser(''),
          mocks.generateUser('', branch1.id),
          mocks.generateUser('member'),
          mocks.generateUser('member', branch1.id),
          mocks.generateUser('member admin'),
          mocks.generateUser('member admin', branch2.id),
          mocks.generateUser('member management'),
          mocks.generateUser('member management', branch3.id),
          mocks.generateUser('admin'),
          mocks.generateUser('admin', branch1.id),
          mocks.generateUser('management'),
          mocks.generateUser('management', branch3.id),
        ], u => _.mapKeys(u, (val, key) => _.snakeCase(key))),
      )
      .returning('*');

    logger.info('Inserting operations...');
    await toolkit.upsertOperationProc(mocks.generateOperation({
      branchId: branch1.id,
      divisionIds: [
        division1.id,
        division2.id,
      ],
      leaderId: users[3].id,
      assignments: [
        mocks.generateOpAssignment({
          userId: users[4].id,
        }),
        mocks.generateOpAssignment(),
      ],
    }));
    await toolkit.upsertOperationProc(mocks.generateOperation({
      leaderId: users[5].id,
      assignments: [
        mocks.generateOpAssignment(),
        mocks.generateOpAssignment(),
        mocks.generateOpAssignment(),
      ],
    }));
    await toolkit.upsertOperationProc(mocks.generateOperation());
  } catch (e) {
    logger.error(e.stack || e);
  }

  try {
    logger.info('Removing temporary login token...');
    await database.removeTestUser(user);
  } catch (e) {
    logger.error(e.stack || e);
  }

  logger.info('Done!');

  process.exit();
})();
