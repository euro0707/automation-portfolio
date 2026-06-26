# Automation Portfolio

Business automation projects using Google Apps Script, n8n, Dify, and Claude AI.

## Projects

| # | Project | Tool | Description |
|---|---------|------|-------------|
| 01 | [Daily Report Automation](gas/01_daily-report-automation/) | GAS | Auto-sends HTML reports from Google Sheets by email |
| 02 | [Form → Sheet → Notify](gas/02_form-to-sheet-notify/) | GAS | Auto-logs form submissions to Sheets and sends email notifications |
| 03 | [Invoice Generator](gas/03_invoice-generator/) | GAS | Auto-generates PDF invoices from Google Sheets and emails them to clients |
| 04 | [External API Notify](gas/04_external-api-notify/) | GAS | Sends real-time notifications from Google Sheets to Slack, LINE, and webhooks |
| 05 | [AI Lead Triage](n8n/05_ai-lead-triage/) | n8n + Claude AI | Webhook → Claude AI analysis → Google Sheets + Slack notification pipeline |
| 06 | [HubSpot CRM Qualifier](n8n/06_hubspot-crm-sync/) | n8n + HubSpot + Claude AI | New contact → Claude AI scoring → HubSpot update + Sheets + Slack alert |
| 07 | [RSS AI Digest — n8n vs Dify](dify/07_rss-workflow-comparison/) | Dify + Claude AI | Same RSS→Slack pipeline built on both platforms with a trade-off comparison |
