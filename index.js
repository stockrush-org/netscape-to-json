#!/usr/bin/env node
'use strict';

// Netscape cookies.txt  <->  JSON (Cookie-Editor / EditThisCookie format,
// the one antidetect browsers and most extensions import).
// Zero dependencies. Online version: https://stockrush.org/en/tools/netscape-to-json

const HTTP_ONLY_PREFIX = '#HttpOnly_';

function netscapeToJson(text) {
  const cookies = [];
  for (const raw of String(text).split(/\r?\n/)) {
    let line = raw.trim();
    if (!line) continue;

    // curl and browsers mark HttpOnly cookies with a "#HttpOnly_" prefix —
    // it looks like a comment but is a real cookie
    let httpOnly = false;
    if (line.startsWith(HTTP_ONLY_PREFIX)) {
      httpOnly = true;
      line = line.slice(HTTP_ONLY_PREFIX.length);
    } else if (line.startsWith('#')) {
      continue;
    }

    const parts = line.split('\t');
    if (parts.length < 7) {
      throw new Error(`Invalid Netscape cookie line (expected 7 tab-separated fields): ${raw}`);
    }
    const [domain, includeSubdomains, path, secure, expires, name, ...valueParts] = parts;
    const expiration = Number(expires);
    const session = !expiration;

    const cookie = {
      domain,
      hostOnly: includeSubdomains.toUpperCase() !== 'TRUE',
      path,
      secure: secure.toUpperCase() === 'TRUE',
      httpOnly,
      session,
      name,
      value: valueParts.join('\t'),
    };
    if (!session) cookie.expirationDate = expiration;
    cookies.push(cookie);
  }
  return cookies;
}

function jsonToNetscape(cookies) {
  const list = typeof cookies === 'string' ? JSON.parse(cookies) : cookies;
  if (!Array.isArray(list)) throw new Error('Expected a JSON array of cookies');

  const lines = ['# Netscape HTTP Cookie File'];
  for (const c of list) {
    const domain = c.domain || '';
    const includeSubdomains = c.hostOnly === undefined ? domain.startsWith('.') : !c.hostOnly;
    const expires = c.session || !c.expirationDate ? 0 : Math.floor(c.expirationDate);
    lines.push([
      (c.httpOnly ? HTTP_ONLY_PREFIX : '') + domain,
      includeSubdomains ? 'TRUE' : 'FALSE',
      c.path || '/',
      c.secure ? 'TRUE' : 'FALSE',
      expires,
      c.name,
      c.value ?? '',
    ].join('\t'));
  }
  return lines.join('\n') + '\n';
}

module.exports = { netscapeToJson, jsonToNetscape };

// CLI: npx netscape-to-json cookies.txt > cookies.json
//      npx netscape-to-json --reverse cookies.json > cookies.txt
if (require.main === module) {
  const fs = require('fs');
  const args = process.argv.slice(2);
  const reverse = args.includes('--reverse') || args.includes('-r');
  const file = args.find((a) => !a.startsWith('-'));
  const input = fs.readFileSync(file || 0, 'utf8');
  try {
    process.stdout.write(reverse
      ? jsonToNetscape(input)
      : JSON.stringify(netscapeToJson(input), null, 2) + '\n');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}
