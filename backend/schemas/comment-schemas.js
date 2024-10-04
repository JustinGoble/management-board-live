const Joi = require('joi');
const common = require('./common-schemas');

const commentPushSchema = Joi.object().keys({
  id: common.incremental.optional(),
  text: Joi.string().max(150),
});

const commentSchema = commentPushSchema.keys({
  text: Joi.string().max(150),
});

const commentListSchema = Joi.object().keys({
  page: common.incremental.optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});

module.exports = {
  commentPushSchema,
  commentSchema,
  commentListSchema,
};
