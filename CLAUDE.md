# CLAUDE.md — n8n-nodes-revenuebase

## Project overview

n8n community node for the RevenueBase B2B data API. Published to npm as `@revenuebase/n8n-nodes-revenuebase`.

## Architecture

**Fully programmatic node** (not declarative) — required because the Email Batch Upload operation uses multipart form data built manually with raw Buffers (no external dependencies).

```
nodes/RevenueBase/
├── RevenueBase.node.ts       # Main execute() — all routing logic lives here
├── EmailDescription.ts       # Email Verification resource UI properties
├── EmailBatchDescription.ts  # Email Batch Job resource UI properties
├── CompanyDescription.ts     # Company resource UI properties
├── UserDescription.ts        # User resource UI properties
├── RevenueBase.node.json     # Codex — categories and doc links
└── RevenueBase.svg           # Brand icon (real logo, also copied to credentials/)

credentials/
├── RevenueBaseApi.credentials.ts  # x-key header auth, tested via GET /v1/credits
└── RevenueBase.svg
```

## API details

- **Base URL:** `https://api.revenuebase.ai`
- **Auth:** `x-key` header
- **v1** endpoints: email verification, batch jobs, user operations
- **v2** endpoints: company resolver

### Endpoint map

| Resource | Operation | Method | Path |
|---|---|---|---|
| Email Verification | Validate | POST | `/v1/process-email` |
| Email Batch Job | Upload | POST | `/v1/batch-upload` (multipart, field: `requested_file`) |
| Email Batch Job | Get Status | POST | `/v1/batch-process-email-status` (body: `process_id`) |
| Email Batch Job | Get Many | GET | `/v1/queued-process` |
| Email Batch Job | Download | POST | `/v1/batch-download` (body: `process_id`) |
| Email Batch Job | Cancel | POST | `/v1/cancel-process` (body: `process_id`) |
| Company | Resolve | POST | `/v2/company-resolver/resolve` |
| Company | Discover | POST | `/v2/company-resolver/discovery` |
| User | Get Credits | GET | `/v1/credits` |
| User | Rotate API Key | POST | `/v1/rotate-key` |

## Development workflow

```bash
npm run build      # compile TypeScript → dist/
npm run lint       # must pass with zero errors before any publish
npm run dev        # start local n8n at localhost:5678 with hot reload
npm run release    # lint + build + version bump + publish (preferred publish method)
```

**Never use `npm publish` directly** — use `npm run release`. The `prepublishOnly` guard was removed; `npm run release` is the safe path.

After any change: rebuild, then hard-refresh the browser (`Cmd+Shift+R`) to clear n8n's icon/node cache.

## Adding a new operation

1. Add the operation option + its fields to the relevant `*Description.ts` file
2. Add the execution branch in `RevenueBase.node.ts` inside `execute()`
3. Run `npm run build && npm run lint`
4. Verify against the RevenueBase API docs — always confirm the exact HTTP method and path before coding (the docs have been accurate for method/path specifics)

## Adding a new resource

1. Create `nodes/RevenueBase/<Resource>Description.ts` with `*Operations` and `*Fields` exports
2. Add the resource option to the `resource` property in `RevenueBase.node.ts`
3. Spread the imports into the `properties` array
4. Add the execution logic in `execute()`
5. Run `npm run build && npm run lint`

## Known gotchas

- **Don't use `requestDefaults`** — this node is programmatic. Adding `requestDefaults` would switch n8n to declarative routing and break the `execute()` method.
- **Multipart upload** builds raw `Buffer.concat` with a boundary string — no `form-data` package. The form field name must be `requested_file` (not `file`).
- **Company Discover** endpoint is `/discovery` (not `/discover`) — easy to mistype.
- **Batch status/download/cancel** all use POST with `process_id` in the JSON body, not GET with a path parameter.
- **Icon cache:** n8n and the browser both cache icons. After an icon change, hard-refresh the browser.
- **SVG icon** lives at `nodes/RevenueBase/RevenueBase.svg` and must also be present in `credentials/RevenueBase.svg`. Both are included in the build via static file copy.

## Publishing

Package: `@revenuebase/n8n-nodes-revenuebase`
Registry: https://registry.npmjs.org
Requires an npm Automation token (or Granular token with "bypass 2FA" enabled) configured in `~/.npmrc`.

```bash
npm run release
```
