# 07: RSS AI Digest — n8n vs Dify

Same requirement — "fetch RSS feed, summarize with AI, post to Slack" — implemented on **both n8n and Dify**, with a documented trade-off comparison.

See [`COMPARISON.md`](COMPARISON.md) for the full analysis (Japanese).

## What It Does

1. Fetches an RSS feed (configurable URL)
2. Classifies and summarizes up to 5 articles using **Claude Haiku** into one-line, category-tagged output
3. Posts the digest to **Slack**

### Dify version (`dify/`)

```
Start(rss_url) → RSS Fetch(Python Code) → Claude Haiku(LLM) → Slack POST(HTTP) → End
```

- RSS is fetched in a Python Code node via `ssrf_proxy` (Dify sandbox requirement)
- LLM node classifies articles into categories: AI/ML, Web Dev, Cloud, Security, Business, Other
- Hardened with per-attempt timeout (10 s) + retry to absorb sandbox hiccups

### n8n version (`dify/n8n-workflow-rss-slack.json`)

```
Schedule → RSS Feed(native) → Code(JS format) → Slack POST(HTTP)
```

- Native `rssFeedRead` node handles XML parsing
- No AI processing — raw title + link digest

## Platforms Compared

| | n8n | Dify |
|---|---|---|
| Trigger | Schedule / Webhook | Manual (rss_url input) |
| RSS parse | Native node | Python Code (manual) |
| AI summary | ✗ | Claude Haiku |
| Self-host complexity | Low (single container) | Medium (nginx + ssrf_proxy + sandbox) |

**Rule of thumb:** pure data plumbing → n8n; AI enrichment → Dify.

## Screenshots

### Dify workflow canvas
![Dify Workflow](dify/rss-slack-notifier.yml)

### n8n workflow canvas
![n8n Workflow](dify/n8n-workflow-canvas.png)

### Slack output
![Slack notification](dify/slack-rss-notification.png)

## Setup

### Dify (self-hosted)

```bash
cd dify/07_rss-workflow-comparison
docker compose up -d
```

Then import `dify/rss-slack-notifier.yml` via the Dify UI → Studio → Import DSL.

Set your Slack webhook URL in the workflow's HTTP node before running.

### n8n

Import `dify/n8n-workflow-rss-slack.json` into your n8n instance.
Set `SLACK_WEBHOOK_URL` as an n8n environment variable.

## Secret Management

Neither workflow stores credentials in the repository.

| Tool | Method |
|------|--------|
| n8n | `$env.SLACK_WEBHOOK_URL` (environment variable reference) |
| Dify | Set in Dify UI only; exported DSL contains a dummy value |
