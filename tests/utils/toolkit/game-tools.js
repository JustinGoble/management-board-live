const request = require('supertest');
const { TEST_TOKEN_ADMIN } = require('../database');

function getGameList() {
  return request(this.app)
    .get('/api/v1/games/list')
    .set('x-token', TEST_TOKEN_ADMIN);
}

function getGames() {
  return request(this.app)
    .get('/api/v1/games')
    .set('x-token', TEST_TOKEN_ADMIN);
}

function getGame(id) {
  return request(this.app)
    .get(`/api/v1/games/${id}`)
    .set('x-token', TEST_TOKEN_ADMIN);
}

function upsertGame(dataset) {
  return request(this.app)
    .post('/api/v1/games')
    .set('x-token', TEST_TOKEN_ADMIN)
    .send(dataset);
}

function deleteGame(id) {
  return request(this.app)
    .delete(`/api/v1/games/${id}`)
    .set('x-token', TEST_TOKEN_ADMIN);
}

module.exports = {
  getGames,
  getGame,
  getGameList,
  upsertGame,
  deleteGame,
};
