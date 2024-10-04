const _ = require('lodash');

function toCase(data, transformer) {
  if (_.isArray(data)) {
    return _.map(data, entry => toCase(entry, transformer));
  }

  if (_.isString(data)) {
    return transformer(data);
  }

  if (_.isObjectLike(data)) {
    return _.mapKeys(data, (value, key) => transformer(key));
  }

  return data;
}

function toCamelCase(data) {
  return toCase(data, _.camelCase);
}

function toSnakeCase(data) {
  return toCase(data, _.snakeCase);
}

module.exports = {
  toCamelCase,
  toSnakeCase,
};
