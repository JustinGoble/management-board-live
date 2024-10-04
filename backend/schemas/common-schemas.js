const Joi = require('joi');

const incremental = Joi.number().integer().min(0);
const createdAt = Joi.date();
const updatedAt = Joi.date();

const stringWithEmpty = Joi.string().allow('');

module.exports = {
  incremental,
  createdAt,
  updatedAt,
  stringWithEmpty,
};
