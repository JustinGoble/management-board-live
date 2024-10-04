const redis = require('redis');
const BPromise = require('bluebird');
const config = require('./config');

BPromise.promisifyAll(redis.RedisClient.prototype);
BPromise.promisifyAll(redis.Multi.prototype);

const client = redis.createClient(config.REDIS_URL);

module.exports = client;
