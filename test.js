'use strict';
const assert = require('assert');
const { netscapeToJson, jsonToNetscape } = require('./index');

const input = [
  '# Netscape HTTP Cookie File',
  '.example.com\tTRUE\t/\tTRUE\t1893456000\tsid\tabc123',
  '#HttpOnly_.example.com\tTRUE\t/\tTRUE\t1893456000\tauth_token\tsecret',
  'example.com\tFALSE\t/app\tFALSE\t0\tsession_id\tx\ty',
].join('\n');

const cookies = netscapeToJson(input);
assert.strictEqual(cookies.length, 3, 'HttpOnly cookie must not be skipped as a comment');
assert.deepStrictEqual(cookies[0], {
  domain: '.example.com', hostOnly: false, path: '/', secure: true, httpOnly: false,
  session: false, name: 'sid', value: 'abc123', expirationDate: 1893456000,
});
assert.strictEqual(cookies[1].httpOnly, true);
assert.strictEqual(cookies[2].session, true);
assert.strictEqual(cookies[2].hostOnly, true);
assert.strictEqual(cookies[2].value, 'x\ty');

// round trip
assert.deepStrictEqual(netscapeToJson(jsonToNetscape(cookies)), cookies);

assert.throws(() => netscapeToJson('broken line'), /Invalid Netscape cookie line/);
console.log('ok');
