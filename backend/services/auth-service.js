const _ = require('lodash');
const moment = require('moment');
const BPromise = require('bluebird');
const { oneLine, stripIndent } = require('common-tags');
const uuidv4 = require('uuid/v4');
const discord = require('../models/discord');
const logger = require('../logger')(__filename);
const userService = require('./user-service');
const { knex } = require('../database').connect();
const redis = require('../redis');

async function startLogin(stateId, returnUrl, userAgent) {
  // Save the return URL and user agent with a 20 min timeout
  await redis.setAsync(
    `login:state:${stateId}`,
    JSON.stringify({ returnUrl, userAgent }),
    'EX', 60 * 60,
  );
}

async function retrieveLoginSessionState(stateId) {
  if (!await redis.existsAsync(`login:state:${stateId}`)) {
    throw new Error(oneLine`
      No login state in memory! Login state is
      discarded if Discord takes too long to respond,
      please try logging in again.
    `);
  }

  const state = JSON.parse(await redis.getAsync(`login:state:${stateId}`));

  await redis.delAsync(`login:state:${stateId}`);

  return state;
}

async function logout(tokenString) {
  logger.info('Processing user logout');

  await knex.transaction(async trx => {
    const [accessToken] = await trx('access_tokens')
      .where('token', tokenString)
      .del()
      .returning('*');

    if (!accessToken) {
      throw new Error('No access token found!');
    }

    const [countResult] = await trx('access_tokens')
      .count('token')
      .where('user_id', accessToken.user_id);

    logger.debug(`User has ${countResult.count} login locations left`);

    if (countResult.count === '0') {
      logger.info(`Invalidating Discord token for user ${accessToken.user_id}`);

      const [discordToken] = await trx('discord_tokens')
        .where('user_id', accessToken.user_id)
        .del()
        .returning('*');

      await discord.revokeToken(discordToken.access_token);
    }
  });
}

async function getTokenInfo(tokenString, retryAttempts = 2) {
  const [token] = await knex('access_tokens')
    .innerJoin('users', 'users.id', 'access_tokens.user_id')
    .innerJoin('discord_tokens', 'users.id', 'discord_tokens.user_id')
    .select(
      'users.id as user_id',
      'users.state',
      'users.permissions',
      'discord_tokens.access_token',
      'discord_tokens.refresh_token',
      'discord_tokens.updated_at',
      'discord_tokens.expires_in',
    )
    .where('access_tokens.token', tokenString)
    .limit(1);

  if (!token) {
    const error = new Error(`Token ${tokenString} is invalid!`);
    error.status = 403;
    throw error;
  }

  const tokenDate = moment(token.updated_at).valueOf();
  const currentDate = moment().valueOf();
  const expirationTime = token.expires_in * 1000;
  const divider = _.random(1, 2, true);

  if (tokenDate + expirationTime / divider < currentDate) {
    try {
      logger.info(`Refreshing Discord token for user ${token.user_id}`);
      await refreshDiscordToken(token.user_id, token.refresh_token);
    } catch (error) {
      // Check if the token has actually expired
      if (tokenDate + expirationTime < currentDate) {
        if (retryAttempts <= 0) {
          throw error;
        }

        // We might be doing multiple refresh attempts at the same
        // time, wait for a bit and retry permission retrieval
        await BPromise.delay(500);
        return getTokenInfo(tokenString, retryAttempts - 1);
      }
    }
  }

  if (token.state !== 'active') {
    const error = new Error(`User ${token.user_id} has been set as inactive!`);
    error.status = 403;
    throw error;
  }

  return {
    userId: token.user_id,
    permissions: _.toString(token.permissions).split(' '),
  };
}

async function saveDiscordToken(userId, discordToken, opts = {}) {
  _.defaults(opts, { trx: knex });

  return await opts.trx.raw(stripIndent`
    INSERT INTO discord_tokens (user_id, access_token, refresh_token, expires_in)
    VALUES (:user_id, :access_token, :refresh_token, :expires_in)
    ON CONFLICT (user_id) DO UPDATE SET
      user_id = :user_id,
      access_token = :access_token,
      refresh_token = :refresh_token,
      expires_in = :expires_in
    RETURNING *;
  `, {
    user_id: userId,
    ..._.pick(discordToken, [
      'access_token',
      'refresh_token',
      'expires_in',
    ]),
  });
}

async function refreshDiscordToken(userId, refreshTokenString) {
  const newToken = await discord.refreshToken(refreshTokenString);
  await saveDiscordToken(userId, newToken);
}

async function saveAccessToken(token, opts = {}) {
  _.defaults(opts, { trx: knex });

  return await opts.trx('access_tokens')
    .insert(token)
    .returning('*');
}

async function handleNewLogin(discordLoginCode, stateId) {
  logger.debug('Handling new discord login');

  const {
    returnUrl,
    userAgent,
  } = await retrieveLoginSessionState(stateId);

  const response = await discord.requestToken(discordLoginCode);

  const user = await discord.getUserInformation(response.access_token);

  if (user.bot) {
    throw new Error('The Discord user has been marked as a bot!');
  }

  /* Can't enable unless management board becomes a bot app
  const odyMembers = await getOdyMembers(response.access_token);

  const guildUser = _.find(odyMembers, m => m.user.id === user.id);
  const roles = _.get(guildUser, 'roles', []);

  logger.info(`Found roles ${JSON.stringify(roles)} for user ID ${user.id}`);
  */

  let accessToken;

  await knex.transaction(async (trx) => {
    let [dbUser] = await trx('users')
      .select('id')
      .where('discord_id', user.id);

    if (!dbUser) {
      logger.info(oneLine`
        Creating a new user with
        ID ${user.id} and
        name ${user.username}#${user.discriminator}
      `);

      const name = `${user.username}#${user.discriminator}`;

      dbUser = await userService.addUser({
        name,
        nickname: name,
        discord_id: user.id,
        permissions: '',
      }, { trx });

      logger.info(`User created: ${JSON.stringify(dbUser)}`);
    }

    await saveDiscordToken(dbUser.id, response, { trx });

    accessToken = {
      user_id: dbUser.id,
      token: uuidv4(),
      user_agent: userAgent,
    };

    await saveAccessToken(accessToken, { trx });
  });

  return {
    token: accessToken.token,
    returnUrl,
  };
}

module.exports = {
  startLogin,
  logout,
  getTokenInfo,
  handleNewLogin,
};
