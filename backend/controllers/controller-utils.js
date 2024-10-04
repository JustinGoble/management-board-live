const Joi = require('joi');
const logger = require('../logger')(__filename);
const eventLogService = require('../services/event-log-service');


// This makes it possible to catch errors from asynchronous controllers.
const wrapController = fn => {
  if (!fn) {
    throw new Error(`Controller is ${fn}`);
  }
  return async (req, res, next) => {
    try {
      const result = await fn(req, res, next);
      if (!res.headersSent) {
        res.json(result);
      } else {
        logger.debug('Headers already sent');
      }
    } catch (err) {
      next(err);
    }
  };
};

/**
 * Validates the given data based on the given schema
 * @param {*} data - The data to be validated
 * @param {*} schema - The schema that is used to validate the data
 * @param {boolean} [patch = false] - Is this a patch request,
 * if true then set all values as optional
 * @throws The data is missing or invalid
 */
function validate(data, schema, patch = false) {
  if (!data) {
    const error = new Error('Missing request parameters!');
    error.status = 400;
    throw error;
  }

  const result = Joi.validate(data, schema, {
    stripUnknown: true,
    presence: patch ? 'optional' : 'required',
  });

  if (result.error) {
    result.error.status = 400;
    throw result.error;
  }

  return result.value;
}

async function logRequest(req, type) {
  const { userId } = req.authentication;

  const logEntry = {
    user: userId,
    type,
    rest_type: req.method,
    request_path: req.originalUrl,
    request_body: JSON.stringify(req.body),
  };
  await eventLogService.addLogEntry(logEntry);
}

module.exports = {
  wrapController,
  validate,
  logRequest,
};
