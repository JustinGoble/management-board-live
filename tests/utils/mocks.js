let opUserNumber = 0;
let branchNumber = 0;
let requestNumber = 0;

function generateUser(permissions, branchId) {
  opUserNumber++;
  return {
    name: `TestUser#${opUserNumber}`,
    nickname: `TestUser${opUserNumber} nickname`,
    branchId: branchId || null,
    discordId: `Discord ID for test user ${opUserNumber}`,
    description: `Description for test user ${opUserNumber}`,
    permissions,
  };
}

function generateBranch() {
  branchNumber++;
  return {
    name: `Test branch ${branchNumber}`,
    description: `Description for test branch ${branchNumber}`,
  };
}

function generateRequest() {
  requestNumber++;
  return {
    details: `Test request ${requestNumber}`,
    type: 'personal',
    content: [
      { name: 'Item 1', quantity: 2 },
      { name: 'Item 1', quantity: 2 },
    ],
  };
}

module.exports = {
  generateUser,
  generateBranch,
  generateRequest,
};
