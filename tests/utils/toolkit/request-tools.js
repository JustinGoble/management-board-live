const request = require('supertest');
const { TEST_TOKEN_ADMIN } = require('../database');

function getRequests(queryParams) {
  return request(this.app)
    .get('/api/v1/requests')
    .query(queryParams)
    .set('x-token', TEST_TOKEN_ADMIN);
}

function getRequest(id) {
  return request(this.app)
    .get(`/api/v1/requests/${id}`)
    .set('x-token', TEST_TOKEN_ADMIN);
}

function upsertRequest(dataset) {
  return request(this.app)
    .post('/api/v1/requests')
    .set('x-token', TEST_TOKEN_ADMIN)
    .send(dataset);
}

function validateRequest(id, approved, reply) {
  return request(this.app)
    .post(`/api/v1/requests/${id}/validate`)
    .set('x-token', TEST_TOKEN_ADMIN)
    .send({ approved, reply });
}

function completeRequest(id, reply) {
  return request(this.app)
    .post(`/api/v1/requests/${id}/complete`)
    .set('x-token', TEST_TOKEN_ADMIN)
    .send({ reply });
}

function pickUpRequest(id) {
  return request(this.app)
    .post(`/api/v1/requests/${id}/pick-up`)
    .set('x-token', TEST_TOKEN_ADMIN);
}

function deleteRequest(id) {
  return request(this.app)
    .delete(`/api/v1/requests/${id}`)
    .set('x-token', TEST_TOKEN_ADMIN);
}

module.exports = {
  getRequests,
  getRequest,
  upsertRequest,
  validateRequest,
  completeRequest,
  pickUpRequest,
  deleteRequest,
};
