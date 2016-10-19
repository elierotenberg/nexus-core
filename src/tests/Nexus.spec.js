/* eslint-disable no-magic-numbers */
const { describe, it } = global;
import t from 'tcomb';
import equal from 'deep-equal';

import nxs, { logger, Cache } from '../';

describe('Nexus', async () => {
  const echo = () => async (params) => params;

  it('hello world inline middleware', async () => {
    const n = nxs().use(async () => 'hello world');
    const r = await n.query();
    t.assert(r === 'hello world');
  });

  it('echo middleware', async () => {
    const n = nxs().use(echo());
    const r = await n.query({ foo: 'bar' });
    t.assert(equal(r, { foo: 'bar' }));
  });

  it('logger', async () => {
    const fnCalls = [];
    const fn = (...args) => fnCalls.push(args);
    const n = nxs()
      .use(logger(fn))
      .use(logger(fn))
      .use(echo())
      .use(logger(fn));
    const r = await n.query({ foo: 'bar' });
    t.assert(equal(r, { foo: 'bar' }));
    t.assert(equal(fnCalls, [
      ['>', { params: { foo: 'bar' }, state: {} }],
      ['>>', { params: { foo: 'bar' }, state: { __NEXUS_LOGGER_DEPTH__: 1 } }],
      ['<<', { res: { foo: 'bar' } }],
      ['<', { res: { foo: 'bar' } }],
    ]));
  });

  it('when', async () => {
    const n = nxs()
      .when((params) => params === 'foo', nxs(async () => 'bar'))
      .when((params) => params === 'fizz', nxs(async () => 'buzz'))
      .use(echo());
    const r = await Promise.all([
      n.query('foo'),
      n.query('fizz'),
      n.query('foobar'),
    ]);
    t.assert(equal(r, [
      'bar',
      'buzz',
      'foobar',
    ]));
  });

  it('Cache', async () => {
    const c = new Cache();
    const n = nxs()
      .use(c.cache())
      .use(echo());
    const r = [
      await n.query('foo'),
      await n.query('bar'),
      await n.query('foo'),
      await n.query('fizz'),
    ];
    t.assert(equal(r, [
      'foo',
      'bar',
      'foo',
      'fizz',
    ]));
    t.assert(c.size() === 3);
    c.purge('foo');
    t.assert(c.size() === 2);
    c.clear();
    t.assert(c.size() === 0);
  });
});
