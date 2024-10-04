const _ = require('lodash');
const Joi = require('joi');
const moment = require('moment');
const logger = require('../logger')(__filename);
const controllerUtils = require('./controller-utils');
const requestService = require('../services/request-service');
const commentService = require('../services/comment-service');
const commonSchemas = require('../schemas/common-schemas');
const requestSchemas = require('../schemas/request-schemas');
const commentSchemas = require('../schemas/comment-schemas');
const { permissions: PERM } = require('../constants');

const LOGGING_TYPE = 'request';

const requestMultiQuerySchema = Joi.object().keys({
  page: commonSchemas.incremental.optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  states: Joi.array().items(
    Joi.any().valid(..._.values(requestService.REQUEST_STATE)),
  ).optional(),
});

const requestIdPathSchema = Joi.object().keys({
  requestId: commonSchemas.incremental,
});

const replyBodySchema = Joi.object().keys({
  reply: commonSchemas.stringWithEmpty.max(5000).optional(),
});

const validationResultBodySchema = replyBodySchema.keys({
  approved: Joi.boolean().default(true),
});

const changePrioritySchema = Joi.object().keys({
  priority: Joi.number().default(3),
});

function throwInvalidInput(message) {
  const error = new Error(message);
  error.status = 403;
  throw error;
}

async function getRequests(req) {
  logger.silly('requestController.getRequests');

  const options = controllerUtils.validate(
    req.query,
    requestMultiQuerySchema,
  );

  const { permissions } = req.authentication;

  const isOnlyMember =
    !_.includes(permissions, PERM.ADMIN)
    && !_.includes(permissions, PERM.INDUSTRY)
    && !_.includes(permissions, PERM.MANAGEMENT);

  if (_.includes(options.states, requestService.REQUEST_STATE.OWN)) {
    const { userId } = req.authentication;
    options.userId = userId;
  }

  if (isOnlyMember) {
    const { userId } = req.authentication;
    options.userId = userId;
    logger.warn('Get Member Only Requests was run!');
    return await requestService.getMemberOnlyRequests(options);
  }
  logger.warn('All requests were retrieved!');
  return await requestService.getRequests(options);
}

async function getRequest(req) {
  logger.silly('requestController.getRequest');

  const { requestId } = controllerUtils.validate(
    req.params,
    requestIdPathSchema,
  );

  const { userId, permissions } = req.authentication;

  const request = await requestService.getRequest(requestId);

  if (
    userId !== request.createdBy
    && !_.includes(permissions, PERM.ADMIN)
    && !_.includes(permissions, PERM.INDUSTRY)
    && !_.includes(permissions, PERM.MANAGEMENT)
  ) {
    throwInvalidInput('Only the request creator or management can display a request!');
  }

  return request;
}

async function upsertRequest(req) {
  logger.silly('requestController.upsertRequest');

  // Validation prunes out all fields except id, content and details
  const request = controllerUtils.validate(
    req.body,
    requestSchemas.requestPushSchema,
  );

  const { userId, permissions } = req.authentication;

  // Check for some invalid modifications, admins can do whatever though
  if (request.id && !_.includes(permissions, PERM.ADMIN)) {
    const oldRequest = await requestService.getRequest(request.id);

    // If has an approval result, can't change content or details
    if (!_.isNil(request.approved) && !_.isEqual(request.content, oldRequest.content)) {
      throwInvalidInput('Changing the content is not allowed after validation!');
    }
  }

  if (!request.id) {
    request.createdBy = userId;
    request.priority = calculatePriority(request);
  }

  await controllerUtils.logRequest(req, LOGGING_TYPE);
  return await requestService.upsertRequest(request);
}

function calculatePriority(request) {
  const typePriorityMap = {
    'organization': 3,
    'personal': 4,
  };

  return typePriorityMap[request.type] || 3;
}

async function validateRequest(req) {
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

async function completeRequest(req) {
  logger.silly('requestController.completeRequest');

  const { requestId } = controllerUtils.validate(
    req.params,
    requestIdPathSchema,
  );

  const { reply } = controllerUtils.validate(
    req.body,
    replyBodySchema,
  );

  const request = await requestService.getRequest(requestId);

  if (!request.validatedAt) {
    throwInvalidInput('Request has not been validated!');
  }

  if (!request.approved) {
    throwInvalidInput('Request was reject, unable to complete!');
  }

  if (request.completedAt) {
    throwInvalidInput('Request is already completed!');
  }

  const { userId } = req.authentication;

  request.completedBy = userId;
  request.completedAt = moment();
  request.reply = reply;

  await controllerUtils.logRequest(req, LOGGING_TYPE);

  return await requestService.updateRequest(request);
}

async function pickUpRequest(req) {
  logger.silly('requestController.pickUpRequest');

  const { requestId } = controllerUtils.validate(
    req.params,
    requestIdPathSchema,
  );

  const { reply } = controllerUtils.validate(
    req.body,
    replyBodySchema,
  );

  const request = await requestService.getRequest(requestId);

  if (!request.completedAt || !request.validatedAt) {
    throwInvalidInput('Request has not been completed!');
  }

  if (request.pickedUpAt) {
    throwInvalidInput('Request is already picked up!');
  }

  const { userId, permissions } = req.authentication;

  if (
    userId !== request.createdBy
    && !_.includes(permissions, PERM.ADMIN)
    && !_.includes(permissions, PERM.INDUSTRY)
    && !_.includes(permissions, PERM.MANAGEMENT)
  ) {
    throwInvalidInput('Only the request creator or management can pick it up!');
  }

  request.pickedUpAt = moment();
  request.reply = reply;

  await controllerUtils.logRequest(req, LOGGING_TYPE);
  return await requestService.updateRequest(request);
}

async function changePriority(req) {
  logger.silly('requestController.changePriority');

  const { requestId } = controllerUtils.validate(
    req.params,
    requestIdPathSchema,
  );

  const { priority } = controllerUtils.validate(
    req.body,
    changePrioritySchema,
  );

  await controllerUtils.logRequest(req, LOGGING_TYPE);
  return await requestService.updateRequest({
    id: requestId,
    priority,
  });
}

async function deleteRequest(req) {
  logger.silly('requestController.deleteRequest');

  const { requestId } = controllerUtils.validate(
    req.params,
    requestIdPathSchema,
  );

  await controllerUtils.logRequest(req, LOGGING_TYPE);
  await requestService.deleteRequest(requestId);
}

async function getRequestComments(req) {
  logger.silly('requestController.getRequestComments');

  const { permissions } = req.authentication;

  if (
    !_.includes(permissions, PERM.ADMIN)
    && !_.includes(permissions, PERM.INDUSTRY)
    && !_.includes(permissions, PERM.MANAGEMENT)
  ) {
    throwInvalidInput('Not Authorized to view Request Comments');
  }

  const { requestId } = controllerUtils.validate(
    req.params,
    requestIdPathSchema,
  );

  const options = controllerUtils.validate(
    req.query,
    commentSchemas.commentListSchema,
  );

  return await commentService.getRequestComments({ requestId, ...options });
}

async function postRequestComment(req) {
  logger.silly('requestController.postRequestComment');

  const { requestId } = controllerUtils.validate(
    req.params,
    requestIdPathSchema,
  );

  const comment = controllerUtils.validate(
    req.body,
    commentSchemas.commentSchema,
  );

  const { userId } = req.authentication;

  comment.userId = userId;
  comment.requestId = requestId;

  await controllerUtils.logRequest(req, LOGGING_TYPE);

  return await commentService.addRequestComment(comment);
}

module.exports = {
  getRequests,
  getRequest,
  upsertRequest,
  validateRequest,
  completeRequest,
  pickUpRequest,
  changePriority,
  deleteRequest,
  postRequestComment,
  getRequestComments,
};
