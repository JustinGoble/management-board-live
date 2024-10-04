const request = require('supertest');
const { TEST_TOKEN_ADMIN } = require('../database');

function getOperations() {
  return request(this.app)
    .get('/api/v1/operations')
    .set('x-token', TEST_TOKEN_ADMIN);
}

function getOperation(id) {
  return request(this.app)
    .get(`/api/v1/operations/${id}`)
    .set('x-token', TEST_TOKEN_ADMIN);
}

function upsertOperation(dataset) {
  return request(this.app)
    .post('/api/v1/operations')
    .set('x-token', TEST_TOKEN_ADMIN)
    .send(dataset);
}

function deleteOperation(id) {
  return request(this.app)
    .delete(`/api/v1/operations/${id}`)
    .set('x-token', TEST_TOKEN_ADMIN);
}

function upsertOpAssignment(operationId, dataset) {
  return request(this.app)
    .post(`/api/v1/operations/${operationId}/assignments`)
    .set('x-token', TEST_TOKEN_ADMIN)
    .send(dataset);
}

function deleteOpAssignment(operationId, assignmentId) {
  return request(this.app)
    .delete(`/api/v1/operations/${operationId}/assignments/${assignmentId}`)
    .set('x-token', TEST_TOKEN_ADMIN);
}

module.exports = {
  getOperations,
  getOperation,
  upsertOperation,
  deleteOperation,
  upsertOpAssignment,
  deleteOpAssignment,
};
