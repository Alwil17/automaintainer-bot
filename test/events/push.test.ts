import nock from 'nock';
import { Probot, ProbotOctokit } from 'probot';
import myProbotApp from '../../src/probot-app';
import pushEvent from '../fixtures/push.json';
import fs from 'fs';
import path from 'path';
import { describe, beforeEach, afterEach, test, expect } from "vitest";

// Mock the GitHub API
nock.disableNetConnect();

const todoIdentifier = "TODO:";

describe('Push event handler', () => {
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

  test('creates an issue when a TODO comment is detected', async () => {
    // Mock the GitHub API endpoints that will be called
    const mock = nock('https://api.github.com')
      // Mock getting the file content
      .get('/repos/hiimbex/testing-things/contents/index.js?ref=abcdefg')
      .reply(200, {
        type: 'file',
        encoding: 'base64',
        name: 'index.js',
        path: 'index.js',
        content: Buffer.from(`// ${todoIdentifier} Fix this later\nconst test = true;`).toString('base64'),
        sha: '123abc',
      })
      // Mock listing existing issues
      .get('/repos/hiimbex/testing-things/issues?state=open&per_page=100')
      .reply(200, [])
      // Mock creating a new issue
      .post('/repos/hiimbex/testing-things/issues', (body) => {
        expect(body.title).toBe('Fix this later in index.js');
        expect(body.body).toContain('Line 1');
        expect(body.body).toContain(`// ${todoIdentifier} Fix this later`);
        expect(body.body).toContain('<!-- todo-hash:');
        return true;
      })
      .reply(201);

    // Send a push webhook event
    await probot.receive({
        name: 'push', payload: pushEvent as any,
        id: ''
    });

    // Ensure all the expected API calls were made
    expect(mock.pendingMocks()).toStrictEqual([]);
  });

  test('handles block comment TODOs', async () => {
    // Mock the GitHub API endpoints
    const mock = nock('https://api.github.com')
      .get('/repos/hiimbex/testing-things/contents/index.js?ref=abcdefg')
      .reply(200, {
        type: 'file',
        encoding: 'base64',
        name: 'index.js',
        path: 'index.js',
        content: Buffer.from(`function test() {\n  /* ${todoIdentifier} Implement this function */\n  return null;\n}`).toString('base64'),
        sha: '123abc',
      })
      .get('/repos/hiimbex/testing-things/issues?state=open&per_page=100')
      .reply(200, [])
      .post('/repos/hiimbex/testing-things/issues', (body) => {
        expect(body.title).toBe('Implement this function in index.js');
        return true;
      })
      .reply(201);

    await probot.receive({
        name: 'push', payload: pushEvent as any,
        id: ''
    });
    expect(mock.pendingMocks()).toStrictEqual([]);
  });

  /* test('handles multi-line TODOs', async () => {
    const mock = nock('https://api.github.com')
      .get('/repos/hiimbex/testing-things/contents/index.js?ref=abcdefg')
      .reply(200, {
        type: 'file',
        encoding: 'base64',
        name: 'index.js',
        path: 'index.js',
        content: Buffer.from(`// ${todoIdentifier} Fix multi-line issue\n// This is a continuation\n// of the TODO comment\nconst test = true;`).toString('base64'),
        sha: '123abc',
      })
      .get('/repos/hiimbex/testing-things/issues?state=open&per_page=100')
      .reply(200, [])
      .post('/repos/hiimbex/testing-things/issues', (body) => {
        expect(body.title).toBe('Fix multi-line issue in index.js');
        expect(body.body).toContain('```');
        return true;
      })
      .reply(201);

    await probot.receive({
        name: 'push', payload: pushEvent as any,
        id: ''
    });
    expect(mock.pendingMocks()).toStrictEqual([]);
  }); */

  test('does not create duplicate issues', async () => {
    const todoHash = '12345abcde'; // This would normally be generated

    const mock = nock('https://api.github.com')
      .get('/repos/hiimbex/testing-things/contents/index.js?ref=abcdefg')
      .reply(200, {
        type: 'file',
        encoding: 'base64',
        name: 'index.js',
        path: 'index.js',
        content: Buffer.from(`// ${todoIdentifier} Fix this later\nconst test = true;').toString('base64`),
        sha: '123abc',
      })
      .get('/repos/hiimbex/testing-things/issues?state=open&per_page=100')
      .reply(200, [
        {
          number: 1,
          title: 'Fix this later in index.js',
          body: `**Line 1** of \`index.js\`:\n\n\`// ${todoIdentifier} Fix this later\`\n\n_Commit: abcdefg_\n\n<!-- todo-hash: ${todoHash} -->`,
        }
      ]);
    
    // No post request should be made
    
    await probot.receive({
        name: 'push', payload: pushEvent as any,
        id: ''
    });
    expect(mock.pendingMocks()).toStrictEqual([]);
  });
});
