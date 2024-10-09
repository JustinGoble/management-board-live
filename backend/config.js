/* eslint-disable no-process-env */

module.exports = {
  PORT: parseInt(process.env.NODE_PORT, 10)
    || parseInt(process.env.PORT, 10)
    || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  LOGGER_LEVEL: process.env.LOGGER_LEVEL || 'info',
  DISABLE_REQUST_LOGGER: process.env.DISABLE_REQUST_LOGGER === 'true',

  DATABASE_URL: process.env.DATABASE_URL,
  SSLMODE: process.env.SSLMODE || '',
  REDIS_URL: process.env.REDIS_URL,

  DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,

  DISCORD_DASHBOARD_CHANNEL_ID: process.env.DISCORD_DASHBOARD_CHANNEL_ID,

  DISCORD_BOT_SECRET: process.env.DISCORD_BOT_SECRET,

  DISABLE_WORKERS: process.env.DISABLE_WORKERS === 'true' || false,

  DISCORD_SERVER_ID: process.env.DISCORD_SERVER_ID,

  /**
   * The user ID to be used for bot generated events and such if no ID
   * is provided by the bot.
   */
  BOT_DEFAULT_USER_ID: parseInt(process.env.BOT_DEFAULT_USER_ID, 10) || 1,

  CALENDARS: {
    GAME_EVENTS: process.env.GOOGLE_CALENDAR_GAME_EVENTS,
    INTERNAL_EVENTS: process.env.GOOGLE_CALENDAR_INTERNAL_EVENTS,
  },

  GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS
    || './google-credentials.json',
  GOOGLE_CREDENTIALS_JSON: process.env.GOOGLE_CREDENTIALS_JSON,

  /**
   * The public base URL of the backend
   */
  BASE_URL: process.env.REACT_APP_BACKEND,
};
