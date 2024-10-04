const request = require('supertest');
const { TEST_TOKEN_ADMIN } = require('../database');

function getUpcomingEvents(calendarName) {
  return request(this.app)
    .get(`/api/v1/events/upcoming/${calendarName}`)
    .set('x-token', TEST_TOKEN_ADMIN);
}

function getEvents() {
  return request(this.app)
    .get('/api/v1/events')
    .set('x-token', TEST_TOKEN_ADMIN);
}

function getEvent(id) {
  return request(this.app)
    .get(`/api/v1/events/${id}`)
    .set('x-token', TEST_TOKEN_ADMIN);
}

function upsertEvent(calendarName, dataset) {
  return request(this.app)
    .post(`/api/v1/events/${calendarName}`)
    .set('x-token', TEST_TOKEN_ADMIN)
    .send(dataset);
}

function deleteEvent(id) {
  return request(this.app)
    .delete(`/api/v1/events/${id}`)
    .set('x-token', TEST_TOKEN_ADMIN);
}

module.exports = {
  getUpcomingEvents,
  getEvents,
  getEvent,
  upsertEvent,
  deleteEvent,
};
