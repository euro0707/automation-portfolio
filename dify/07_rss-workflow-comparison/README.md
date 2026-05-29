# Automation Portfolio

Google Apps Script / n8n automation projects for Upwork clients.

## Projects

| # | Project | Description |
|---|---------|-------------|
| 01 | [Daily Report Automation](gas/01_daily-report-automation/) | Auto-sends HTML reports from Google Sheets by email |
| 02 | [Form → Sheet → Notify](gas/02_form-to-sheet-notify/) | Auto-logs form submissions to Sheets and sends email notifications |
| 03 | [Invoice Generator](gas/03_invoice-generator/) | Auto-generates PDF invoices from Google Sheets and emails them to clients |
| 04 | [External API Notify](gas/04_external-api-notify/) | Sends real-time notifications from Google Sheets to Slack, LINE, and webhooks |
| 05 | [AI Lead Triage (n8n)](n8n/lead-triage/) | Webhook → Claude AI analysis → Google Sheets + Slack notification pipeline |
| 06 | [HubSpot CRM Qualifier (n8n)](n8n/hubspot-crm-sync/) | HubSpot new contact → Claude AI scoring → HubSpot update + Sheets + Slack alert |

## Tech Stack

- **Automation**: Google Apps Script, n8n
- **AI Integration**: Claude API
- **Integrations**: Google Sheets, Slack, LINE, HubSpot, Webhook
- **Portfolio Site**: Static site generation

## Setup

```bash
# Install dependencies
npm install

# View project metadata
cat gas/*/portfolio.json
cat n8n/*/portfolio.json
```

## File Structure

```
.
├── gas/                 # Google Apps Script projects
├── n8n/                 # n8n automation workflows
├── site/                # Portfolio site (generated)
├── scripts/             # Build/utility scripts
└── package.json         # Node dependencies
```
