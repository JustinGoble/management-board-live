const Joi = require('joi');
const common = require('./common-schemas');

const userPushSchema = Joi.object().keys({
  name: Joi.string(),
  discordId: Joi.string(),
  description: common.stringWithEmpty.optional().allow(null),
  permissions: Joi.array().items(Joi.string()).optional(),
  state: Joi.any().valid(['active', 'inactive']).optional(),
});

const userSchema = userPushSchema.keys({
  id: common.incremental,
  createdAt: common.createdAt,
  updatedAt: common.updatedAt,
});

module.exports = {
  userPushSchema,
  userSchema,
};
