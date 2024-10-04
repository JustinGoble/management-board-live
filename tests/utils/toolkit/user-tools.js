const request = require('supertest');
const { TEST_TOKEN_ADMIN } = require('../database');

function getUsers() {
  return request(this.app)
    .get('/api/v1/users')
    .set('x-token', TEST_TOKEN_ADMIN);
}

function getUser(id) {
  return request(this.app)
    .get(`/api/v1/users/${id}`)
    .set('x-token', TEST_TOKEN_ADMIN);
}

function getUserList() {
  return request(this.app)
    .get('/api/v1/users/list')
    .set('x-token', TEST_TOKEN_ADMIN);
}

function updateUser(id, dataset) {
  return request(this.app)
    .patch(`/api/v1/users/${id}`)
    .set('x-token', TEST_TOKEN_ADMIN)
    .send(dataset);
}

function deleteUser(id) {
  return request(this.app)
    .delete(`/api/v1/users/${id}`)
    .set('x-token', TEST_TOKEN_ADMIN);
}

module.exports = {
  getUsers,
  getUser,
  getUserList,
  updateUser,
  deleteUser,
};
