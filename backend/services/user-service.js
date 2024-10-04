const _ = require('lodash');
const { oneLine } = require('common-tags');
//const moment = require('moment');

const serviceUtils = require('./service-utils');
const logger = require('../logger')(__filename);
const { knex } = require('../database').connect();

const throwNotFound = (userId) => {
  const error = new Error(`User ${userId} not found!`);
  error.status = 404;
  throw error;
};

function mapItem(row) {
  row.permissions = _.compact(_.split(row.permissions, ' '));

  return serviceUtils.toCamelCase(row);
}

function mapToDb(user) {
  const dbUser = serviceUtils.toSnakeCase(user);
  if (dbUser.permissions) {
    dbUser.permissions = _.join(user.permissions, ' ');
  }
  if (dbUser.discordRoles) {
    dbUser.discordRoles = _.join(user.discordRoles, ' ');
  }
  return dbUser;
}

async function getUsers(opts = {}) {
  _.defaults(opts, {
    page: 0,
    limit: 50,
    sortField: 'name',
    sortOrder: 'asc',
    search: undefined,
    active: undefined,
    hasPermissions: undefined,
  });

  let query = knex('users');

  if (opts.search) {
    query = query.where((builder) =>
      builder
        .whereRaw("name LIKE '%' || ? || '%'", [opts.search])
        .orWhereRaw("nickname LIKE '%' || ? || '%'", [opts.search]),
    );
  }

  if (!_.isNil(opts.active)) {
    if (opts.active) {
      query = query.where('state', 'active');
    } else {
      query = query.whereNot('state', 'active');
    }
  }

  if (!_.isNil(opts.hasPermissions)) {
    if (opts.hasPermissions) {
      query = query.whereRaw('length(permissions) > 0');
    } else {
      query = query.whereRaw('(length(permissions) = 0 or permissions is null)');
    }
  }

  const countQuery = query.clone();

  const orderMap = { ascend: 'asc', descend: 'desc' };

  const rows = await query
    .select()
    .orderBy(_.snakeCase(opts.sortField), orderMap[opts.sortOrder])
    .orderBy('id', 'asc')
    .limit(opts.limit)
    .offset(opts.limit * opts.page);

  const [{ count }] = await countQuery.count();

  return {
    totalHits: parseInt(count),
    results: rows.map(mapItem),
  };
}

async function getUser(userId) {
  const [user] = await knex('users')
    .leftJoin(
      'user_discord_role',
      'user_discord_role.user_discord_id',
      'users.discord_id',
    )
    .select(
      'users.*',
      knex.raw(oneLine`
        coalesce(
          json_agg(user_discord_role.discord_role_id)
            FILTER (WHERE user_discord_role.discord_role_id IS NOT NULL),
          '[]'::json
        ) as discord_roles
      `),
    )
    .where('users.id', userId)
    .groupBy('users.id');

  if (!user) {
    throwNotFound(userId);
  }

  return mapItem(user);
}

async function getUserWithDiscordId(discordId) {
  const [user] = await knex('users')
    .select('*')
    .where('users.discord_id', discordId);

  if (!user) {
    throwNotFound(discordId);
  }

  return mapItem(user);
}

async function getDiscordIds() {
  const rows = await knex('users')
    .select('id', 'discord_id', 'name');

  return rows.map(mapItem);
}

async function setServerInfo(users) {
  // Update Discord info to all users
  for (const user of users) {
    logger.debug(`Updating user with discord ID ${user.discordId}`);
    await knex('users')
      .where('discord_id', user.discordId)
      .update({
        nickname: user.nickname,
        server: user.server,
      });

    await knex.transaction(async trx => {
      // Remove current user Discord role mappings
      await trx('user_discord_role')
        .del()
        .where('user_discord_id', user.discordId);

      // Recreate Discord role mappings
      const roleIds = user.discordRoles || [];
      for (const roleId of roleIds) {
        await trx('user_discord_role')
          .insert({
            user_discord_id: user.discordId,
            discord_role_id: roleId,
          });
      }
    });
  }
}

async function getCurrentUser(token) {
  const [user] = await knex('users')
    .innerJoin('access_tokens', 'users.id', 'access_tokens.user_id')
    .select('users.*')
    .where('access_tokens.token', token)
    .limit(1);

  if (!user) {
    throwNotFound('@me');
  }

  return mapItem(user);
}

async function getUserList() {
  return await knex('users')
    .select('id', knex.raw('coalesce(nickname, name) as nickname'))
    .orderBy('nickname', 'asc');
}

async function addUser(user, opts = {}) {
  _.defaults(opts, { trx: knex });

  const dbUser = mapToDb(user);

  const rows = await opts.trx('users')
    .insert(dbUser)
    .returning('*');

  // Trigger a Discord data update
  // Do the require here in order to avoid a circular dependency

  return mapItem(rows[0]);
}

async function updateUser(userId, user) {
  const dbUser = mapToDb(user);

  const [updatedUser] = await knex('users')
    .where('id', userId)
    .update(dbUser)
    .returning('*');

  if (!updatedUser) {
    throwNotFound(userId);
  }

  return mapItem(updatedUser);
}

async function deleteUser(userId) {
  const [user] = await knex('users')
    .where('id', userId)
    .del()
    .returning('*');

  if (!user) {
    throwNotFound(userId);
  }
}

module.exports = {
  getUsers,
  getUser,
  getUserWithDiscordId,
  getDiscordIds,
  setServerInfo,
  getCurrentUser,
  getUserList,
  addUser,
  updateUser,
  deleteUser,
};
