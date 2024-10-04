const Joi = require('joi');
const common = require('./common-schemas');

const applicationPushSchema = Joi.object().keys({
  id: common.incremental.optional(),
  over_eighteen: Joi.boolean().optional(),
  country: Joi.string().optional(),
  answers: Joi.string().optional(),
  state: Joi.any().valid(['created', 'approved', 'unapproved', 'rejected']).optional(),
});

const applicationSchema = applicationPushSchema.keys({
  id: common.incremental,
  createdAt: common.createdAt,
  updatedAt: common.updatedAt,
  applicantId: common.incremental,
});

module.exports = {
  applicationPushSchema,
  applicationSchema,
};
