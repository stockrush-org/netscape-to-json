# netscape-to-json

Convert **Netscape `cookies.txt`** to **JSON** (the Cookie-Editor / EditThisCookie format that antidetect browsers and most cookie extensions import) — and back.

- Zero dependencies, one file
- Keeps `#HttpOnly_` cookies (many converters silently drop them as comments)
- Session cookies, `hostOnly`, `secure`, tabs inside values — handled
- Works as a CLI or a Node.js module

**Don't want to install anything?** Use the free online version: **[stockrush.org/en/tools/netscape-to-json](https://stockrush.org/en/tools/netscape-to-json)** — runs in your browser, nothing is uploaded.

## CLI

```bash
npx github:stockrush-org/netscape-to-json cookies.txt > cookies.json

# JSON back to Netscape
npx github:stockrush-org/netscape-to-json --reverse cookies.json > cookies.txt

# or via stdin
cat cookies.txt | npx github:stockrush-org/netscape-to-json
```

## Node.js

```js
const { netscapeToJson, jsonToNetscape } = require('netscape-to-json');

const cookies = netscapeToJson(fs.readFileSync('cookies.txt', 'utf8'));
const txt = jsonToNetscape(cookies);
```

## Formats

Netscape line (7 tab-separated fields):

```
.example.com	TRUE	/	TRUE	1893456000	sid	abc123
#HttpOnly_.example.com	TRUE	/	TRUE	1893456000	auth_token	secret
```

JSON output:

```json
[
  {
    "domain": ".example.com",
    "hostOnly": false,
    "path": "/",
    "secure": true,
    "httpOnly": false,
    "session": false,
    "name": "sid",
    "value": "abc123",
    "expirationDate": 1893456000
  }
]
```

| Netscape field | JSON field |
|---|---|
| domain (with `#HttpOnly_` prefix) | `domain`, `httpOnly: true` |
| include subdomains `TRUE/FALSE` | `hostOnly` (inverted) |
| path | `path` |
| secure `TRUE/FALSE` | `secure` |
| expiration (unix seconds, `0` = session) | `expirationDate`, `session` |
| name | `name` |
| value | `value` |

## More tools

Free browser tools for working with accounts and cookies — 2FA code generator, cookie format detector, Base64 ↔ JSON, duplicate remover: **[stockrush.org/en/tools](https://stockrush.org/en/tools)**

Made by [StockRush](https://stockrush.org) — marketplace for digital goods.

## License

MIT
