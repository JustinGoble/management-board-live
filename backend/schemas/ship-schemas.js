const Joi = require('joi');
const common = require('./common-schemas');

const shipPushSchema = Joi.object().keys({
  id: common.incremental.optional(),
  name: Joi.string().max(300),
  coreSize: Joi.string().max(100),
  categoryId: common.incremental.max(300),

  // These integer fields are rounded in the backend service
  emptyWeightTons: Joi.number().min(0).optional().allow(null),
  maxCargoTons: Joi.number().min(0).optional().allow(null),
  maxWeightTons: Joi.number().min(0).optional().allow(null),

  maxVelocityKMPerH: Joi.number().min(0).optional().allow(null),
  atmoThrustG: Joi.number().min(0).optional().allow(null),
  atmoBrakingG: Joi.number().min(0).optional().allow(null),
  spaceThrustG: Joi.number().min(0).optional().allow(null),
  spaceBrakingG: Joi.number().min(0).optional().allow(null),
});

const shipSchema = shipPushSchema.keys({
  id: common.incremental,
});

module.exports = {
  shipPushSchema,
  shipSchema,
};
