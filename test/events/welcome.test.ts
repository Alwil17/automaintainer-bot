import nock from 'nock';
import { Probot, ProbotOctokit } from 'probot';
import myProbotApp from '../../src/probot-app';
import issueOpenedPayload from '../fixtures/issues.opened.json';
import { describe, beforeEach, afterEach, test, expect, vi } from "vitest";
import { isFirstIssue, postWelcomeComment } from '../../src/events/welcome';

describe('Welcome features', () => {
  let probot: Probot;
  
  beforeEach(() => {
    nock.disableNetConnect();
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

  test('detects first issue correctly', async () => {
    // Simuler une réponse avec un seul issue (le premier)
    const issuesListMock = nock('https://api.github.com')
      .get('/repos/hiimbex/testing-things/issues')
      .query({ creator: 'first-time-user', state: 'all' })
      .reply(200, [{ id: 123, number: 1 }]);
    
    const context = {
      repo: () => ({ owner: 'hiimbex', repo: 'testing-things' }),
      octokit: {
        issues: {
          listForRepo: vi.fn().mockResolvedValue({ data: [{ id: 123 }] })
        }
      },
      log: { error: vi.fn() }
    } as any;

    const result = await isFirstIssue(context, 'first-time-user');
    expect(result).toBe(true);
    expect(issuesListMock.isDone()).toBe(true);
  });

  test('identifies non-first issue correctly', async () => {
    // Simuler une réponse avec plusieurs issues
    const issuesListMock = nock('https://api.github.com')
      .get('/repos/hiimbex/testing-things/issues')
      .query({ creator: 'regular-user', state: 'all' })
      .reply(200, [{ id: 123 }, { id: 456 }]);
    
    const context = {
      repo: () => ({ owner: 'hiimbex', repo: 'testing-things' }),
      octokit: {
        issues: {
          listForRepo: vi.fn().mockResolvedValue({ data: [{ id: 123 }, { id: 456 }] })
        }
      },
      log: { error: vi.fn() }
    } as any;

    const result = await isFirstIssue(context, 'regular-user');
    expect(result).toBe(false);
    expect(issuesListMock.isDone()).toBe(true);
  });

  test('posts welcome comment on first issue', async () => {
    // Mock pour la vérification de première issue
    const issuesListMock = nock('https://api.github.com')
      .get('/repos/hiimbex/testing-things/issues')
      .query({ creator: 'first-time-user', state: 'all' })
      .reply(200, [{ id: 123, number: 1 }]);
    
    // Mock pour la création du commentaire
    const commentMock = nock('https://api.github.com')
      .post('/repos/hiimbex/testing-things/issues/1/comments', body => {
        expect(body.body).toContain('Welcome and thanks for opening your first issue');
        return true;
      })
      .reply(201);
    
    // Mock pour la configuration
    nock('https://api.github.com')
      .get('/repos/hiimbex/testing-things/contents/.github/auto-maintainer.yml')
      .reply(404); // Pas de fichier de config, va utiliser le message par défaut
    
    // Préparer le payload avec un premier issue
    const modifiedPayload = {
      ...issueOpenedPayload,
      issue: {
        ...issueOpenedPayload.issue,
        user: {
          login: 'first-time-user'
        }
      }
    };
    
    await probot.receive({
      name: 'issues',
      id: '1',
      payload: modifiedPayload as any
    });
    
    expect(issuesListMock.isDone()).toBe(true);
    expect(commentMock.isDone()).toBe(true);
  });
});
