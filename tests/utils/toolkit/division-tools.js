const request = require('supertest');
const { TEST_TOKEN_ADMIN } = require('../database');

function getDivisionList() {
  return request(this.app)
    .get('/api/v1/divisions/list')
    .set('x-token', TEST_TOKEN_ADMIN);
}

function getDivisions() {
  return request(this.app)
    .get('/api/v1/divisions')
    .set('x-token', TEST_TOKEN_ADMIN);
}

function getDivision(id) {
  return request(this.app)
    .get(`/api/v1/divisions/${id}`)
    .set('x-token', TEST_TOKEN_ADMIN);
}

function upsertDivision(dataset) {
  return request(this.app)
    .post('/api/v1/divisions/')
    .set('x-token', TEST_TOKEN_ADMIN)
    .send(dataset);
}

function deleteDivision(id) {
  return request(this.app)
    .delete(`/api/v1/divisions/${id}`)
    .set('x-token', TEST_TOKEN_ADMIN);
}

module.exports = {
  getDivisions,
  getDivision,
  getDivisionList,
  upsertDivision,
  deleteDivision,
};
