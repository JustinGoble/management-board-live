const _ = require('lodash');
const { expect } = require('chai');
const App = require('../backend/app');
const { createToolkit } = require('./utils/toolkit');
const mocks = require('./utils/mocks');
const database = require('./utils/database');

describe('/api/v1/requests', () => {
  let app;
  let toolkit;

  beforeEach(async () => {
    await database.resetDatabase();

    app = new App();
    toolkit = createToolkit(app);
    await app.startAsync();
  });

  afterEach(() => {
    app.close();
  });

  async function createdRequest() {
    const request = mocks.generateRequest();
    return await toolkit.upsertRequestProc(request);
  }

  async function approvedRequest() {
    const request = await createdRequest();
    return await toolkit.validateRequestProc(request.id, true);
  }

  async function rejectedRequest(reply) {
    const request = await createdRequest();
    return await toolkit.validateRequestProc(request.id, false, reply);
  }

  async function completedRequest(reply) {
    const request = await approvedRequest();
    return await toolkit.completeRequestProc(request.id, reply);
  }

  async function pickedUpRequest(reply) {
    const request = await completedRequest(reply);
    return await toolkit.pickUpRequestProc(request.id);
  }

  it('should go through the entire request pipeline', async () => {
    const request = mocks.generateRequest();
    const createdRequest = await toolkit.upsertRequestProc(request);

    expect(createdRequest).to.include({
      validatedBy: null,
      validatedAt: null,
      approved: null,
      completedBy: null,
      completedAt: null,
      pickedUpAt: null,
      reply: null,
    });

    await toolkit.validateRequestProc(createdRequest.id, true);
    await toolkit.completeRequestProc(createdRequest.id, 'Reply text');
    const finalRequest = await toolkit.pickUpRequestProc(createdRequest.id);

    for (const key in finalRequest) {
      expect(
        finalRequest[key],
        `Key ${key} should not have a null value`,
      ).to.not.equal(null);
    }
  });

  it('should return multiple requests', async () => {
    const requests = [
      await completedRequest('Reply text'),
      await rejectedRequest('Rejection reason'),
      await createdRequest(),
    ];

    const { totalHits, results } = await toolkit.getRequestsProc({});

    expect(totalHits).to.equal(3);
    expect(results.length).to.equal(3);
    _.forEach(requests, request => {
      delete request.content; // Not in the bulk response
      delete request.reply; // Not in the bulk response
      expect(results).to.deep.include(request);
    });
  });

  it('should return only created, approved and completed requests', async () => {
    const requests = [
      await createdRequest(),
      await rejectedRequest(),
      await approvedRequest(),
      await completedRequest('Reply text'),
      await pickedUpRequest('Reply text'),
    ];

    const { totalHits, results } = await toolkit.getRequestsProc({
      states: ['created', 'approved', 'completed'],
    });

    expect(totalHits).to.equal(3);
    expect(results.length).to.equal(3);
    _.forEach([requests[0], requests[2], requests[3]], request => {
      delete request.content; // Not in the bulk response
      delete request.reply; // Not in the bulk response
      expect(results).to.deep.include(request);
    });
  });

  it('should not be able to set a reply when approving a request', async () => {
    const request = mocks.generateRequest();
    const createdRequest = await toolkit.upsertRequestProc(request);

    await toolkit.validateRequestProc(createdRequest.id, true, 'Reason', 403);
  });

  it('should update request partially', async () => {
    const request = await approvedRequest();

    expect(request.details).to.not.equal(null);

    request.details = null;
    await toolkit.upsertRequestProc(request);
    const retrievedRequest = await toolkit.getRequestProc(request.id);

    expect(retrievedRequest.details).to.equal(null);
  });

  it('should delete request', async () => {
    const request = await createdRequest();
    await toolkit.deleteRequestProc(request.id);
    await toolkit.getRequestProc(request.id, 404);
  });
});
