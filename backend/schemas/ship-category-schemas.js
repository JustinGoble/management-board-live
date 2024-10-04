const Joi = require('joi');
const common = require('./common-schemas');

const shipCategoryPushSchema = Joi.object().keys({
  id: common.incremental.optional(),
  name: Joi.string().max(40),
  description: common.stringWithEmpty.max(200).optional().allow(null),
});

const shipCategorySchema = shipCategoryPushSchema.keys({
  id: common.incremental,
});

module.exports = {
  shipCategoryPushSchema,
  shipCategorySchema,
};
