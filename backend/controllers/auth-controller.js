const _ = require('lodash');
const Joi = require('joi');
const useragent = require('useragent');
const logger = require('../logger')(__filename);
const controllerUtils = require('./controller-utils');
const authService = require('../services/auth-service');
const discord = require('../models/discord');

const loginQuerySchema = Joi.object().keys({
  state: Joi.string(),
  returnUrl: Joi.string(),
});

const callbackQuerySchema = Joi.object().keys({
  code: Joi.string(),
  state: Joi.string(),
});

async function login(req, res) {
  logger.silly('authController.login');

  const { state, returnUrl } = controllerUtils.validate(
    req.query,
    loginQuerySchema,
  );

  const userAgent = useragent.parse(req.headers['user-agent']).toString();

  logger.debug(`New login flow with return URL ${returnUrl} and agent ${userAgent}`);

  await authService.startLogin(state, returnUrl, userAgent);

  logger.debug('Redirecting to https://discordapp.com/oauth2/authorize');

  res.redirect(
    'https://discordapp.com/oauth2/authorize' +
    `?client_id=${discord.CLIENT_ID}` +
    '&scope=identify' +
    '&response_type=code' +
    `&redirect_uri=${encodeURIComponent(discord.redirect)}` +
    `&state=${state}`,
  );
}

async function callback(req, res) {
  logger.silly('authController.callback');

  const { code, state } = controllerUtils.validate(
    req.query,
    callbackQuerySchema,
  );

  const {
    token,
    returnUrl,
  } = await authService.handleNewLogin(code, state);

  res.cookie('token', token).redirect(returnUrl);
}

async function logout(req) {
  logger.silly('authController.logout');

  const { token } = req.authentication;

  await authService.logout(token);
}

function createVerifier(...allowedPermissions) {
  if (allowedPermissions.length === 0) {
    return async (req, res, next) => { next(); };
  }

  return async function verify(req, res, next) {
    try {
      const token = (req.header('x-token') || '').trim();

      if (!token) {
        const error = new Error('Missing auth token!');
        error.status = 401;
        return next(error);
      }

      req.authentication = { token };

      if (_.includes(allowedPermissions, 'all')) {
        return next();
      }

      const { userId, permissions } = await authService.getTokenInfo(token);
      // eslint-disable-next-line require-atomic-updates
      req.authentication.userId = userId;
      req.authentication.permissions = permissions;

      if (_.intersection(permissions, allowedPermissions).length === 0) {
        const error = new Error('Insufficient rights!');
        error.status = 403;
        return next(error);
      }
    } catch (err) {
      return next(err);
    }

    next();
  };
}

module.exports = {
  login,
  callback,
  logout,
  createVerifier,
};
