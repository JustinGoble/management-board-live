const _ = require('lodash');
const Joi = require('joi');
const { oneLine } = require('common-tags');
const logger = require('../logger')(__filename);
const controllerUtils = require('./controller-utils');
const userService = require('../services/user-service');
const commonSchemas = require('../schemas/common-schemas');
const userSchemas = require('../schemas/user-schemas');
const { permissions: PERM } = require('../constants');

const LOGGING_TYPE = 'user';

const userMultiQuerySchema = Joi.object().keys({
  page: commonSchemas.incremental.optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  sortField: Joi.string().optional(),
  sortOrder: Joi.any().valid('ascend', 'descend').optional(),
  search: Joi.string().allow('').optional(),
  active: Joi.boolean().optional(),
  hasPermissions: Joi.boolean().optional(),
});

const userIdPathSchema = Joi.object().keys({
  userId: commonSchemas.incremental,
});

async function getUsers(req) {
  logger.silly('userController.getUsers');

  const options = controllerUtils.validate(
    req.query,
    userMultiQuerySchema,
  );

  return await userService.getUsers(options);
}

async function getUser(req) {
  logger.silly('userController.getUser');

  const { userId } = controllerUtils.validate(
    req.params,
    userIdPathSchema,
  );

  return await userService.getUser(userId);
}

async function getCurrentUser(req) {
  logger.silly('userController.getCurrentUser');

  const { token } = req.authentication;

  return await userService.getCurrentUser(token);
}

async function getUserList() {
  logger.silly('userController.getUserList');

  return await userService.getUserList();
}


async function updateUser(req) {
  logger.silly('userController.updateUser');

  const { userId: currentUserId, permissions } = req.authentication;

  const { userId } = controllerUtils.validate(
    req.params,
    userIdPathSchema,
  );

  const user = controllerUtils.validate(
    req.body,
    userSchemas.userPushSchema,
    true,
  );

  const oldUser = await userService.getUser(userId);

  if (!_.includes(permissions, PERM.ADMIN)) {
    if (currentUserId !== userId) {
      const error = new Error(oneLine`
        Logged in as user ${currentUserId} but trying to edit
        the user ${userId} without sufficient permissions!
      `);
      error.status = 403;
      throw error;
    }

    if (user.permissions && !_.isEqual(oldUser.permissions, user.permissions)) {
      const error = new Error(oneLine`
        Trying to modify the permissions of the user ${userId}
        without admin rights!
      `);
      error.status = 403;
      throw error;
    }

    if (user.name && oldUser.name !== user.name) {
      const error = new Error(oneLine`
        Trying to modify the name of the user ${userId}
        without admin rights!
      `);
      error.status = 403;
      throw error;
    }
  }

  await controllerUtils.logRequest(req, LOGGING_TYPE);
  return await userService.updateUser(
    userId,
    user,
  );
}

async function deleteUser(req) {
  logger.silly('userController.deleteUser');

  const { userId: currentUserId, permissions } = req.authentication;

  const { userId } = controllerUtils.validate(
    req.params,
    userIdPathSchema,
  );

  if (currentUserId !== userId && !_.includes(permissions, PERM.ADMIN)) {
    const error = new Error(oneLine`
      Logged in as user ${currentUserId} but trying to delete
      the user ${userId} without sufficient permissions!
    `);
    error.status = 403;
    throw error;
  }

  if (currentUserId !== userId) {
    // Only create a log entry if the user is not deleting themselves.
    // When deleting themselves, the log entry would block the deletion.
    await controllerUtils.logRequest(req, LOGGING_TYPE);
  }

  await userService.deleteUser(userId);
}

module.exports = {
  getUsers,
  getUser,
  getCurrentUser,
  getUserList,
  updateUser,
  deleteUser,
};
