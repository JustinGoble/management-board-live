const axios = require('axios');
const FormData = require('form-data');
const logger = require('../logger')(__filename);
const config = require('../config');

const redirect = `${config.BASE_URL}/api/v1/discord/callback`;

const CLIENT_ID = config.DISCORD_CLIENT_ID;
const CLIENT_SECRET = config.DISCORD_CLIENT_SECRET;

async function requestToken(code) {
  logger.debug('Requesting Discord token');

  const form = new FormData();
  form.append('client_id', CLIENT_ID);
  form.append('client_secret', CLIENT_SECRET);
  form.append('grant_type', 'authorization_code');
  form.append('code', code);
  form.append('redirect_uri', redirect);
  form.append('scope', 'identify');

  try {
    const { data } = await axios({
      method: 'POST',
      url: 'https://discordapp.com/api/v6/oauth2/token',
      data: form,
      headers: form.getHeaders(),
    });
    return data;
  } catch (error) {
    logger.warn('Error when requesting Discord token');
    throw error;
  }
}

async function refreshToken(refresh_token) {
  logger.debug('Refreshing Discord token');

  const form = new FormData();
  form.append('client_id', CLIENT_ID);
  form.append('client_secret', CLIENT_SECRET);
  form.append('grant_type', 'refresh_token');
  form.append('refresh_token', refresh_token);
  form.append('redirect_uri', redirect);
  form.append('scope', 'identify');

  try {
    const { data } = await axios({
      method: 'POST',
      url: 'https://discordapp.com/api/v6/oauth2/token',
      data: form,
      headers: form.getHeaders(),
    });
    return data;
  } catch (error) {
    logger.warn('Error when refreshing Discord token');
    throw error;
  }
}

async function revokeToken(token) {
  logger.debug('Invalidating Discord token');

  const form = new FormData();
  form.append('client_id', CLIENT_ID);
  form.append('client_secret', CLIENT_SECRET);
  form.append('grant_type', 'refresh_token');
  form.append('token', token);
  form.append('redirect_uri', redirect);
  form.append('scope', 'identify');

  try {
    const { data } = await axios({
      method: 'POST',
      url: 'https://discordapp.com/api/v6/oauth2/token/revoke',
      data: form,
      headers: form.getHeaders(),
    });
    return data;
  } catch (error) {
    logger.warn('Error when revoking Discord token');
    throw error;
  }
}

async function getUserInformation(token) {
  logger.debug('Retrieving Discord user information');
  const { data } = await axios({
    method: 'GET',
    url: 'https://discordapp.com/api/users/@me',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
}

module.exports = {
  redirect,
  CLIENT_ID,
  CLIENT_SECRET,

  requestToken,
  refreshToken,
  revokeToken,
  getUserInformation,
};
