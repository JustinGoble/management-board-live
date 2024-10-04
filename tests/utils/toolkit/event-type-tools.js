const request = require('supertest');
const { TEST_TOKEN_ADMIN } = require('../database');

function getEventTypeList() {
  return request(this.app)
    .get('/api/v1/event-types/list')
    .set('x-token', TEST_TOKEN_ADMIN);
}

function getEventTypes() {
  return request(this.app)
    .get('/api/v1/event-types')
    .set('x-token', TEST_TOKEN_ADMIN);
}

function getEventType(id) {
  return request(this.app)
    .get(`/api/v1/event-types/${id}`)
    .set('x-token', TEST_TOKEN_ADMIN);
}

function upsertEventType(dataset) {
  return request(this.app)
    .post('/api/v1/event-types')
    .set('x-token', TEST_TOKEN_ADMIN)
    .send(dataset);
}

function deleteEventType(id) {
  return request(this.app)
    .delete(`/api/v1/event-types/${id}`)
    .set('x-token', TEST_TOKEN_ADMIN);
}

module.exports = {
  getEventTypes,
  getEventType,
  getEventTypeList,
  upsertEventType,
  deleteEventType,
};
