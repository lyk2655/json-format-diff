# JSON Diff Tools

A fast, 100% client-side collection of JSON developer tools.
Live site: **https://jsondifftools.com**

## Why this exists

Most JSON diff/format tools just throw an error when your JSON is slightly off
(a single quote, a trailing comma, an unquoted key). This one **auto-repairs**
those mistakes before doing anything — paste messy JSON and it just works.

## Tools

| Tool | Link |
|------|------|
| JSON Diff (with auto-repair) | https://jsondifftools.com/ |
| JSON Formatter | https://jsondifftools.com/json-formatter |
| JSON Validator | https://jsondifftools.com/json-validator |
| JSON Minify | https://jsondifftools.com/json-minify |
| JSON → CSV | https://jsondifftools.com/json-to-csv |
| JSON → YAML | https://jsondifftools.com/json-to-yaml |
| YAML → JSON | https://jsondifftools.com/yaml-to-json |
| XML → JSON | https://jsondifftools.com/xml-to-json |
| JSON Viewer | https://jsondifftools.com/json-viewer |

## Highlights

- **Auto-repair** — fixes common JSON errors automatically (single quotes, unquoted keys, trailing commas, extra chars)
- **100% local** — everything runs in your browser, nothing is uploaded
- **Free & no sign-up**
- **Dark mode**

## Stack

Vue 3 + Vite + vue-router + Cloudflare Pages.

## Local development

```bash
npm install
npm run dev      # start dev server
npm run build    # build for production (output: dist/)
```

Deploy the `dist/` folder to Cloudflare Pages.
