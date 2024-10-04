const Joi = require('joi');
const logger = require('../logger')(__filename);
const controllerUtils = require('./controller-utils');
const eventLogService = require('../services/event-log-service');
const commonSchemas = require('../schemas/common-schemas');

const eventLogMultiQuerySchema = Joi.object().keys({
  page: commonSchemas.incremental.optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});

async function getEventLogs(req) {
  logger.silly('eventLogController.getEventLogs');

  const options = controllerUtils.validate(
    req.query,
    eventLogMultiQuerySchema,
  );

  return await eventLogService.getEventLogs(options);
}

module.exports = {
  getEventLogs,
};
