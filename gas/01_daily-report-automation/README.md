# Daily Report Automation — Google Apps Script

Automatically generates and emails a daily (or weekly) summary report from your Google Spreadsheet — no manual work required.

---

## What It Does

| Without this script | With this script |
|---|---|
| Open spreadsheet every morning | Get a report in your inbox at 7 AM |
| Copy-paste data into emails | Fully formatted HTML email, auto-sent |
| Manually calculate totals | Category breakdown + KPIs calculated automatically |

---

## Features

- **Daily & weekly reports** — separate functions and triggers for each mode
- **Auto column detection** — reads your header row (English or Japanese), no hardcoded column numbers
- **Email-client-compatible HTML** — tested in Gmail and Outlook (table-based layout)
- **Error logging** — failures are logged to a `_Log` sheet and sent as an alert email
- **Works standalone or container-bound** — set a `SPREADSHEET_ID` or run directly from the sheet

---

## Sample Report Output

![Email Preview](img/email-preview.png)

---

## Prerequisites

- Google account with access to Google Sheets and Gmail
- [Node.js](https://nodejs.org/) (for clasp CLI)
- [clasp](https://github.com/google/clasp) — `npm install -g @google/clasp`

---

## Setup

### 1. Clone this project

```bash
git clone <this-repo>
cd 01_daily-report-automation
```

### 2. Login to clasp

```bash
clasp login
```

### 3. Create a new GAS project

```bash
clasp create --title "Daily Report Automation" --type standalone
```

### 4. Edit CONFIG in `daily_report_automation.js`

```javascript
const CONFIG = {
  SPREADSHEET_ID: "your-spreadsheet-id-here",  // from the sheet URL
  EMAIL_TO:       "you@example.com",
  SHEET_NAME:     "Data",                        // your sheet tab name
  TRIGGER_HOUR_DAILY: 7,                         // send at 7:00 AM
};
```

### 5. Push and run

```bash
clasp push --force
clasp open          # opens GAS editor in browser
```

In the GAS editor:
1. Select `setupDailyTrigger` → Run (one time only)
2. Select `sendDailyReport` → Run to test immediately

---

## Spreadsheet Format

The script auto-detects columns from your header row. Supported header names:

| Column   | Accepted headers |
|----------|-----------------|
| Date     | `date`, `日付`, `日時` |
| Category | `category`, `カテゴリ`, `分類` |
| Item     | `item`, `項目`, `内容`, `品名` |
| Amount   | `amount`, `金額`, `売上`, `price` |
| Status   | `status`, `ステータス`, `状態` |

If a header isn't found, it falls back to columns A–E.

---

## File Structure

```
01_daily-report-automation/
├── daily_report_automation.js   # Main script
├── appsscript.json              # GAS manifest (timezone, runtime)
└── README.md
```

---

## Customization

| What | How |
|------|-----|
| Change report time | Edit `TRIGGER_HOUR_DAILY` in CONFIG |
| Weekly report | Run `setupWeeklyTrigger()` instead of `setupDailyTrigger()` |
| Multiple recipients | `EMAIL_TO: "a@example.com, b@example.com"` |
| Different spreadsheet | Set `SPREADSHEET_ID` in CONFIG |

---

## Tech Stack

- Google Apps Script (V8 runtime)
- Google Sheets API (SpreadsheetApp)
- Gmail API (MailApp)
- clasp for local development & deployment

---

## License

MIT
