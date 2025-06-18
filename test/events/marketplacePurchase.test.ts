import nock from 'nock';
import { Probot, ProbotOctokit } from 'probot';
import myProbotApp from '../../src/probot-app';
import marketplacePurchaseEvent from '../fixtures/marketplace_purchase_purchased.json';
import marketplaceCancelEvent from '../fixtures/marketplace_purchase_cancelled.json';
import { describe, beforeEach, afterEach, test, expect } from "vitest";

// Mock the GitHub API
nock.disableNetConnect();

describe('Marketplace purchase event handler', () => {
  let probot: Probot;

  beforeEach(() => {
    probot = new Probot({
      appId: 1,
      githubToken: 'test',
      // Disable request throttling and retries for testing
      Octokit: ProbotOctokit.defaults({
        retry: { enabled: false },
        throttle: { enabled: false },
      }),
    });
    
    myProbotApp(probot);
  });

  afterEach(() => {
    nock.cleanAll();
  });

  test('handles new purchases correctly', async () => {
    // Mock API endpoints
    const mock = nock('https://api.github.com')
      // Mock listing repos
      .get('/installation/repositories')
      .reply(200, { repositories: [] })
      // Mock creating welcome issue
      .post('/repos/octocat/.github/issues', (body) => {
        expect(body.title).toBe('Welcome to AutoMaintainer!');
        return true;
      })
      .reply(201);

    // Send a marketplace purchase webhook event
    await probot.receive({
      name: 'marketplace_purchase',
      payload: marketplacePurchaseEvent as any,
      id: ''
    });

    expect(mock.pendingMocks()).toStrictEqual([]);
  });

  test('handles cancellations correctly', async () => {
    // Mock API endpoints
    const mock = nock('https://api.github.com')
      // Mock creating feedback issue
      .post('/repos/octocat/.github/issues', (body) => {
        expect(body.title).toBe('Feedback on AutoMaintainer');
        return true;
      })
      .reply(201);

    // Send a marketplace cancellation webhook event
    await probot.receive({
      name: 'marketplace_purchase',
      payload: marketplaceCancelEvent as any,
      id: ''
    });

    expect(mock.pendingMocks()).toStrictEqual([]);
  });
});
