const _ = require('lodash');
const nock = require('nock');

function nockPersistingAuth() {
  nock('https://www.googleapis.com')
    .persist()
    .post('/oauth2/v4/token')
    .reply(200);
}

/**
 * Takes a base event created by mocking and merges it into the
 * Google Calendar event template JSON. The ID is replaced if provided.
 * @param {[string]} gEventId The Google ID of the event, only used if the
 *    base event doesn't have it already.
 * @param {*} baseEvent The mocked base event that contains all of the unique
 *    event information.
 */
function buildEventResponse(gEventId, baseEvent) {
  const event = _.cloneDeep(require('./responses/google-calendar-event.json'));

  const { gEvent } = _.cloneDeep(baseEvent);

  event.id = gEvent.id || gEventId;
  event.summary = gEvent.summary;
  event.description = gEvent.description;
  event.start.dateTime = gEvent.start.dateTime;
  event.end.dateTime = gEvent.end.dateTime;

  return event;
}

function nockEventCreation(calendarId, gEventId, baseEvent) {
  const event = buildEventResponse(gEventId, baseEvent);

  nock('https://www.googleapis.com')
    .post(`/calendar/v3/calendars/${calendarId}/events`)
    .reply(200, event);
}

function nockEventUpdate(calendarId, gEventId, baseEvent) {
  const event = buildEventResponse(gEventId, baseEvent);

  nock('https://www.googleapis.com')
    .put(`/calendar/v3/calendars/${calendarId}/events/${gEventId}`)
    .reply(200, event);
}

function nockEventRetrieval(calendarId, gEventId, baseEvent) {
  const event = buildEventResponse(gEventId, baseEvent);

  nock('https://www.googleapis.com')
    .get(`/calendar/v3/calendars/${calendarId}/events/${gEventId}`)
    .reply(200, event);
}

function nockUpcomingEventRetrieval(calendarId, baseEvents) {
  const events = _.map(baseEvents, baseEvent =>
    buildEventResponse(null, baseEvent),
  );

  const items = _.filter(
    events,
    e => e.start.dateTime > (new Date()).toISOString(),
  );

  const response = {
    items,
  };

  nock('https://www.googleapis.com')
    .get(`/calendar/v3/calendars/${calendarId}/events`)
    .query(true)
    .reply(200, response);
}

function nockEventRemoval(calendarId, gEventId) {
  nock('https://www.googleapis.com')
    .delete(`/calendar/v3/calendars/${calendarId}/events/${gEventId}`)
    .reply(200);
}

module.exports = {
  nockPersistingAuth,
  nockEventCreation,
  nockEventUpdate,
  nockEventRetrieval,
  nockUpcomingEventRetrieval,
  nockEventRemoval,
};
