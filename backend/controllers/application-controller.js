const Joi = require('joi');
const logger = require('../logger')(__filename);
const controllerUtils = require('./controller-utils');
const applicationService = require('../services/application-service');
const commonSchemas = require('../schemas/common-schemas');
const applicationSchemas = require('../schemas/application-schemas');

const LOGGING_TYPE = 'application';

const applicationMultiQuerySchema = Joi.object().keys({
  page: commonSchemas.incremental.optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});

const applicationIdPathSchema = Joi.object().keys({
  applicationId: commonSchemas.incremental,
});

async function reviewApplication(req) {
  logger.silly('requestController.validateRequest');

  const { requestId } = controllerUtils.validate(
    req.params,
    requestIdPathSchema,
  );

  const { approved, reply } = controllerUtils.validate(
    req.body,
    validationResultBodySchema,
  );

  const request = await requestService.getRequest(requestId);

  if (reply && approved) {
    throwInvalidInput('A reply can only be posted when rejecting a request!');
  }

  if (request.validatedAt) {
    throwInvalidInput('Request is already validated!');
  }

  const { userId } = req.authentication;

  request.validatedBy = userId;
  request.validatedAt = moment();
  request.approved = approved;
  request.reply = reply ? reply : null;

  await controllerUtils.logRequest(req, LOGGING_TYPE);
  return await requestService.updateRequest(request);
}

async function getApplicationList() {
  logger.silly('applicationController.getApplicationList');

  return await applicationService.getApplicationList();
}

async function getApplications(req) {
  logger.silly('applicationController.getApplications');

  const options = controllerUtils.validate(
    req.query,
    applicationMultiQuerySchema,
  );

  return await applicationService.getApplications(options);
}

async function getApplication(req) {
  logger.silly('applicationController.getApplication');

  const { applicationId } = controllerUtils.validate(
    req.params,
    applicationIdPathSchema,
  );

  return await applicationService.getApplication(applicationId);
}

async function upsertApplication(req) {
  logger.silly('applicationController.upsertApplication');

  const application = controllerUtils.validate(
    req.body,
    applicationSchemas.applicationPushSchema,
  );

  const { userId } = req.authentication;
  application.applicantId = userId;

  await controllerUtils.logRequest(req, LOGGING_TYPE);
  return await applicationService.upsertApplication(application);
}

async function deleteApplication(req) {
  logger.silly('applicationController.deleteApplication');

  const { applicationId } = controllerUtils.validate(
    req.params,
    applicationIdPathSchema,
  );

  await controllerUtils.logRequest(req, LOGGING_TYPE);
  await applicationService.deleteApplication(applicationId);
}

module.exports = {
  reviewApplication,
  getApplicationList,
  getApplications,
  getApplication,
  upsertApplication,
  deleteApplication,
};
