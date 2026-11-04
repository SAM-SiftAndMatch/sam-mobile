/* global __dirname */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { moduleUrl } = require('./helpers/loadAppModule.cjs');
const routes = import(moduleUrl(path.resolve(__dirname, '../src/navigation/routes.ts')));
const selectors = import(
  moduleUrl(path.resolve(__dirname, '../src/features/marketplace/model/selectors.ts'))
);

test('navigation sends identifiers, not serialized records, and rejects unknown screens', async () => {
  const { screenDestination, singleParam } = await routes;
  assert.deepEqual(
    screenDestination('ApplyJob', { job: { id: 'job-1', privateData: true }, page: 2 }),
    { pathname: '/apply', params: { jobId: 'job-1', page: '2' } },
  );
  assert.throws(() => screenDestination('Missing'), /Unknown screen/);
  assert.equal(singleParam(['job-1', 'job-2']), 'job-1');
});

test('marketplace excludes drafts/closed jobs and consistently matches search/skills', async () => {
  const { selectOpenJobs } = await selectors;
  const job = {
    id: 'a',
    title: 'Ứng dụng',
    description: 'Dự án',
    skills: ['React Native'],
    category: 'Mobile',
    status: 'open',
  };
  assert.deepEqual(
    selectOpenJobs(
      [job, { ...job, id: 'b', status: 'draft' }, { ...job, id: 'c', status: 'completed' }],
      ' REACT ',
    ),
    [job],
  );
  assert.deepEqual(selectOpenJobs([job], '', 'Web'), []);
});

test('owned project/proposal selectors do not expose another account records', async () => {
  const { selectUserProjects, selectUserProposals } = await selectors;
  const jobs = [
    { id: 'a', customerId: 'client-a' },
    { id: 'b', customerId: 'client-b' },
  ];
  const proposals = [
    { jobId: 'a', customerId: 'client-a', freelancerId: 'dev', status: 'pending' },
    { jobId: 'b', customerId: 'client-b', freelancerId: 'dev', status: 'accepted' },
  ];
  assert.deepEqual(selectUserProjects(jobs, proposals, { id: 'dev', role: 'freelancer' }), [
    jobs[1],
  ]);
  assert.deepEqual(selectUserProjects(jobs, proposals, { id: 'client-a', role: 'customer' }), [
    jobs[0],
  ]);
  assert.deepEqual(selectUserProposals(proposals, { id: 'client-a', role: 'customer' }), [
    proposals[0],
  ]);
  assert.deepEqual(selectUserProjects(jobs, proposals, null), []);
});
