// @ts-check
/* eslint-disable require-atomic-updates */

const _ = require('lodash');
const googleapis = require('googleapis');
const fs = require('fs');
const config = require('./config');
const logger = require('./logger')(__filename);

const calendar = googleapis.google.calendar('v3');

if (config.GOOGLE_CREDENTIALS_JSON) {
  // If the Google Credentials are given as JSON, write them into a file
  logger.info(`Writing Google credentials to ${config.GOOGLE_APPLICATION_CREDENTIALS}`);
  fs.writeFileSync(
    config.GOOGLE_APPLICATION_CREDENTIALS,
    config.GOOGLE_CREDENTIALS_JSON,
  );
}

// This method looks for the GOOGLE_APPLICATION_CREDENTIALS
// environment variable.
const gAuth = new googleapis.google.auth.GoogleAuth({
  // Scopes can be specified either as an array or as a single, space-delimited string.
  scopes: ['https://www.googleapis.com/auth/calendar'],
});

let authClient = null;

async function getAuthClient() {
  if (!authClient) {
    authClient = await gAuth.getClient();
  }
  return authClient;
}

const end = new Date();
end.setHours(end.getHours() + 2);

// eslint-disable-next-line no-unused-vars
const testEvent = {
  id: 'r0ga85m3uvr3gfd938s4p3g6j0',
  summary: 'Test event auto updated',
  description: 'Test event desc',
  start: {
    dateTime: (new Date()).toISOString(),
  },
  end: {
    dateTime: end.toISOString(),
  },
};

/**
 * Returns upcoming calendar events with repeating events expanded into single ones.
 * @param {string} calendarId Calendar ID
 * @returns {Promise<googleapis.calendar_v3.Schema$Event[]>} Calendar event list
 */
async function getUpcomingEvents(calendarId) {
  const res = await calendar.events.list({
    calendarId,
    timeMin: (new Date()).toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: 10, // 2500 is max, 250 is default
    auth: await getAuthClient(),
  });

  return res.data.items;
}

/**
 * Returns an event of a calendar.
 * @param {string} calendarId Calendar ID
 * @param {string} eventId Event ID
 * @returns {Promise<googleapis.calendar_v3.Schema$Event>} Event
 */
async function getEvent(calendarId, eventId) {
  const res = await calendar.events.get({
    calendarId,
    eventId,
    auth: await getAuthClient(),
  });

  return res.data;
}

/**
 * Inserts an event to a calendar.
 * @param {string} calendarId Calendar ID
 * @param {googleapis.calendar_v3.Schema$Event} event Event object
 * @returns {Promise<googleapis.calendar_v3.Schema$Event>} Inserted event
 */
async function insertEvent(calendarId, event) {
  const res = await calendar.events.insert({
    calendarId,
    requestBody: event,
    auth: await getAuthClient(),
  });

  return res.data;
}

/**
 * Updates an event to a calendar.
 * @param {string} calendarId Calendar ID
 * @param {googleapis.calendar_v3.Schema$Event} event Event object
 * @returns {Promise<googleapis.calendar_v3.Schema$Event>} Updated event
 */
async function updateEvent(calendarId, event) {
  const res = await calendar.events.update({
    calendarId,
    eventId: event.id,
    requestBody: event,
    auth: await getAuthClient(),
  });

  return res.data;
}

/**
 * Upserts an event to a calendar. If the event has an ID, it will be
 * updated. If not, it will be inserted.
 * @param {string} calendarId Calendar ID
 * @param {googleapis.calendar_v3.Schema$Event} event Event object
 * @returns {Promise<googleapis.calendar_v3.Schema$Event>} Updated or inserted event
 */
async function upsertEvent(calendarId, event) {
  if (!event.id) {
    return insertEvent(calendarId, event);
  }

  return updateEvent(calendarId, event);
}

/**
 * Deletes an event from a calendar.
 * @param {string} calendarId Calendar ID
 * @param {string} eventId Event ID
 */
async function deleteEvent(calendarId, eventId) {
  await calendar.events.delete({
    calendarId,
    eventId,
    auth: await getAuthClient(),
  });
}

module.exports = {
  getUpcomingEvents,
  getEvent,
  insertEvent,
  updateEvent,
  upsertEvent,
  deleteEvent,
};

async function main() {
  // If called from the command prompt, list all primary calendars
  const res = await calendar.calendarList.list({
    auth: await getAuthClient(),
  });
  logger.info(JSON.stringify(res.data, null, 2));
  const events = await getUpcomingEvents(config.CALENDARS.GAME_EVENTS);
  logger.info(JSON.stringify(_.map(events, e => _.pick(e, ['start', 'summary'])), null, 2));
}

// @ts-ignore
if (require.main === module) {
  // Direct call from the command prompt
  main().catch(logger.error);
}
