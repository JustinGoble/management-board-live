const request = require('supertest');
const { TEST_TOKEN_ADMIN } = require('../database');

function getBranchList() {
  return request(this.app)
    .get('/api/v1/branches/list')
    .set('x-token', TEST_TOKEN_ADMIN);
}

function getBranches() {
  return request(this.app)
    .get('/api/v1/branches')
    .set('x-token', TEST_TOKEN_ADMIN);
}

function getBranch(id) {
  return request(this.app)
    .get(`/api/v1/branches/${id}`)
    .set('x-token', TEST_TOKEN_ADMIN);
}

function upsertBranch(dataset) {
  return request(this.app)
    .post('/api/v1/branches')
    .set('x-token', TEST_TOKEN_ADMIN)
    .send(dataset);
}

function deleteBranch(id) {
  return request(this.app)
    .delete(`/api/v1/branches/${id}`)
    .set('x-token', TEST_TOKEN_ADMIN);
}

module.exports = {
  getBranches,
  getBranch,
  getBranchList,
  upsertBranch,
  deleteBranch,
};
