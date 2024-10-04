const _ = require('lodash');
const { expect } = require('chai');
const App = require('../backend/app');
const { createToolkit } = require('./utils/toolkit');
const mocks = require('./utils/mocks');
const database = require('./utils/database');

describe('/api/v1/users', () => {
  let app;
  let toolkit;

  let createdBranch;

  beforeEach(async () => {
    await database.resetDatabase();

    app = new App();
    toolkit = createToolkit(app);
    await app.startAsync();

    const branch = mocks.generateBranch();
    createdBranch = await toolkit.upsertBranchProc(branch);
  });

  afterEach(() => {
    app.close();
  });

  it('should return all users', async () => {
    const res = await toolkit.getUsersProc();

    expect(res.totalHits).to.equal(2);

    const retrievedUsers = res.results;

    const retrievedSingleUser = await toolkit.getUserProc(retrievedUsers[0].id);
    expect(retrievedSingleUser).to.deep.include(retrievedUsers[0]);

    const listUsers = await toolkit.getUserListProc();
    for (const listUser of listUsers) {
      const retrievedUser = _.find(retrievedUsers, u => u.id === listUser.id);
      expect(retrievedUser).to.deep.include(listUser);
    }
  });

  it('should update whole user', async () => {
    const res = await toolkit.getUsersProc();
    const [user] = res.results;
    const newPerm = user.permissions[0] === 'admin' ? 'member' : 'admin';
    mocks.generateUser(); // Offset the user mock counter
    const newUser = mocks.generateUser([newPerm], createdBranch.id);

    _.forEach(newUser, (value, key) => {
      expect(value).to.not.deep.equal(user[key]);
    });

    await toolkit.updateUserProc(user.id, newUser);
    const retrievedUser = await toolkit.getUserProc(user.id);

    // Nickname can't be updated with the update API
    newUser.nickname = retrievedUser.nickname;

    expect(retrievedUser).to.deep.include(newUser);
  });

  it('should update user partially', async () => {
    const newName = 'New name';

    const res = await toolkit.getUsersProc();
    const [user] = res.results;

    expect(user.name).to.not.equal(newName);

    user.name = newName;

    await toolkit.updateUserProc(user.id, user);
    const retrievedUser = await toolkit.getUserProc(user.id);

    expect(retrievedUser.name).to.equal(newName);
  });

  it('should delete user', async () => {
    // Events will prevent user deletion
    await database.clearEvents();

    const res = await toolkit.getUsersProc();
    const [user] = res.results;
    await toolkit.deleteUserProc(user.id);
    await toolkit.getUserProc(user.id, 403);
  });
});
