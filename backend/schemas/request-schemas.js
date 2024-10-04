const Joi = require('joi');
const common = require('./common-schemas');

const requestPushSchema = Joi.object().keys({
  id: common.incremental.optional(),
  content: Joi.array().items(Joi.object({
    id: common.incremental.optional(),
    name: Joi.string().max(100),
    quantity: Joi.number().integer().min(1),
    tag: Joi.string().max(100).optional(),
  })),
  details: Joi.string().max(5000).optional().allow(null),
  tags: Joi.array().items(Joi.string().max(100)).optional(),
  type: Joi.string().max(100).required(),
});

const requestSchema = requestPushSchema.keys({
  id: common.incremental,
  createdAt: common.createdAt,
  // Requests contain other stuff, but that should just be ignored, since
  // it's modified with special endpoints
});

module.exports = {
  requestPushSchema,
  requestSchema,
};
