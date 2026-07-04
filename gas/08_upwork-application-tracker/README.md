# 08: Upwork Application Tracker (Form → Sheets → Dashboard)

Tracks every Upwork application through a Google Form and turns the log into a live KPI dashboard — reply rate, hire rate, and Connects ROI — with zero external services.

## What It Does

1. You submit the **Google Form** right after applying (under 30 seconds, works on mobile)
2. The application is **logged to Google Sheets** automatically
3. A trigger stamps the row with **Status = "Applied"** and a status dropdown
   (`Applied / Replied / Interview / Hired / Declined / No Response`)
4. You update the status as the conversation progresses, and enter **Earned USD** when paid
5. The **Dashboard sheet** recomputes everything instantly: reply rate, hire rate,
   average budget, Connects cost vs. earnings, and monthly trends

## Screenshots

### Logging Form (respondent view)
![Form](img/form.png)

### Responses Sheet with Status Column
![Sheet](img/sheet.jpg)

### KPI Dashboard
![Dashboard](img/dashboard.png)

## Setup

### 1. Deploy with clasp

```bash
clasp create --type standalone --title "08 Upwork Application Tracker"
clasp push --force
```

### 2. Run `createForm()` Once

Open the GAS editor → select `createForm` → **Run**.
This generates the Google Form (7 fields, bilingual labels) and a linked spreadsheet.
Copy the **Spreadsheet ID** from the execution log.

### 3. Configure the Script

Open `upwork_tracker.js` and set:

```js
var SPREADSHEET_ID = "your-spreadsheet-id-here";
```

Then `clasp push --force` again.

### 4. Run `setupDashboard()` Once

Creates the Dashboard sheet with all KPI formulas.
Approve the permission dialog when prompted.

### 5. Run `setupTrigger()` Once

Registers the form-submit trigger (removes duplicates automatically).

### 6. Test

Run `testSetup()` — it inserts 3 dummy applications (Applied / Replied / Hired with $360 earned)
so you can verify the sheet, the status dropdown, and every Dashboard formula.

## Dashboard KPIs

| Section | Metrics |
|---------|---------|
| Applications | Total, this month, reply rate, hire rate, average budget, Connects used |
| Money Summary | Total earned, Connects cost (× $0.15, configurable via `CONNECT_COST_USD`), net profit |
| Status Breakdown | Count per status (6 statuses) |
| Monthly Trend | Applications and earnings for the last 6 months |

## File Structure

```
08_upwork-application-tracker/
├── upwork_tracker.js  # Main script
├── appsscript.json    # GAS manifest
├── img/               # Screenshots (dummy data only)
└── README.md
```

## Key Functions

| Function | Description |
|----------|-------------|
| `createForm()` | Generates the Form + linked spreadsheet (run once) |
| `onFormSubmit(e)` | Stamps Status="Applied" + dropdown on each submission |
| `setupDashboard()` | Builds the formula-driven Dashboard sheet (run once) |
| `setupTrigger()` | Registers the form-submit trigger (run once) |
| `testSetup()` | Inserts 3 dummy applications for verification |
