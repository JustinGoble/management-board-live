const Joi = require('joi');
const common = require('./common-schemas');

const craftingItemSchema = Joi.object().keys({
  id: common.incremental.optional(),
  name: Joi.string().max(300),
});

const craftingItemCategorySchema = Joi.object().keys({
  id: common.incremental.optional(),
  name: Joi.string().max(300),
  tag: Joi.string().valid(['industry', 'navy', 'schematic', 'ship', 'voxel']).optional().allow(null),
  data: Joi.array().items(
    Joi.alternatives().try(
      Joi.string().max(300),
      Joi.lazy(() => craftingItemCategorySchema),
      craftingItemSchema,
    ),
  ),
});

module.exports = {
  craftingItemSchema,
  craftingItemCategorySchema,
};


