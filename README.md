# n8n-nodes-revenuebase

This is an n8n community node. It lets you use RevenueBase in your n8n workflows.

RevenueBase is a B2B data platform that provides verified email addresses, firmographic company data, and real-time email verification — built for sales, marketing, and RevOps teams.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)
[Operations](#operations)
[Credentials](#credentials)
[Compatibility](#compatibility)
[Usage](#usage)
[Resources](#resources)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

### Email Verification
- **Validate** — Validate a single email address for deliverability synchronously. Returns `Valid`, `Invalid`, or `Unknown`.

### Email Batch Job
- **Upload** — Upload a CSV or JSON file of email addresses for asynchronous bulk validation.
- **Get Status** — Check the processing status of a batch job (`QUEUED`, `PROCESSING`, `COMPLETED`, `ERROR`, `CANCELLED`).
- **Get Many** — List all active batch jobs currently queued or in progress.
- **Download** — Download the results of a completed batch job as a binary file.
- **Cancel** — Cancel a queued or in-progress batch job.

### Company
- **Resolve** — Match a company name (and optionally domain or website) to a verified RevenueBase record and return firmographic data.
- **Discover** — Search for companies using a keyword or natural-language description. Returns up to 2,000 results ranked by similarity score.

### User
- **Get Credits** — Return the number of validation credits remaining on the account.
- **Rotate API Key** — Generate a new API key and immediately invalidate the previous one.

## Credentials

You will need a RevenueBase API key to authenticate requests.

1. Sign in to the [RevenueBase dashboard](https://app.revenuebase.ai).
2. Go to **Settings → API Keys** and copy your key.
3. In n8n, create a new **RevenueBase API** credential and paste the key into the **API Key** field.

All requests are authenticated via the `x-key` header. You can validate your credentials using the **Test** button in the credentials dialog — it calls `GET /v1/credits` to confirm the key is active.

## Compatibility

Tested against n8n version 1.x. No known incompatibilities with earlier 1.x releases.

## Usage

### Batch email validation workflow

1. Use a **Read Binary File** (or **HTTP Request**) node to load your CSV of email addresses.
2. Connect it to a **RevenueBase** node set to **Email Batch Job → Upload**.
3. Store the returned `process_id`.
4. Use a **Wait** node on an interval, then a **RevenueBase** node set to **Email Batch Job → Get Status** to poll until the status is `COMPLETED`.
5. Use **Email Batch Job → Download** to retrieve the results file as binary data.

### Company discovery

Use **Company → Discover** to build targeted account lists from a keyword or ICP description. Pass the returned company records into a CRM node (e.g. HubSpot, Salesforce) to enrich or create accounts automatically.

### Rotating API keys safely

The **User → Rotate API Key** operation immediately invalidates your current key. Update the n8n credential with the new key before making any further requests.

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
* [RevenueBase API reference](https://docs.revenuebase.ai/api-reference/overview)
* [RevenueBase authentication docs](https://docs.revenuebase.ai/api-reference/authentication)
