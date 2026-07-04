// ============================================================
// 08: Upwork Application Tracker (Form → Sheets → Dashboard)
// ============================================================
// Sheet columns ("Form Responses 1"):
//   [A] Timestamp
//   [B] Job Title / 案件名
//   [C] Job URL / 案件URL
//   [D] Client Name / クライアント名
//   [E] Budget USD / 予算（ドル）
//   [F] Job Type / 案件種別  (Fixed / Hourly)
//   [G] Connects Used / 使用Connects
//   [H] Notes / メモ
//   [I] Status       (set by onFormSubmit, updated manually)
//   [J] Earned USD   (entered manually when paid)
//
// Setup:
//   1. Run createForm() once — creates the Form + Spreadsheet
//   2. Paste the logged Spreadsheet ID into SPREADSHEET_ID below,
//      then `clasp push --force` again
//   3. Run setupDashboard() once
//   4. Run setupTrigger() once
//   5. Run testSetup() to verify with dummy data
// ============================================================

var SPREADSHEET_ID   = "PASTE_YOUR_SPREADSHEET_ID_HERE";
var RESPONSES_SHEET  = "Form Responses 1";
var DASHBOARD_SHEET  = "Dashboard";
var FORM_TITLE       = "Upwork Application Tracker / Upwork 応募記録";
var CONNECT_COST_USD = 0.15;
var STATUS_OPTIONS   = ["Applied", "Replied", "Interview", "Hired", "Declined", "No Response"];
var STATUS_COL       = 9;   // column I
var EARNED_COL       = 10;  // column J

// ----------------------------------------------------------------
// createForm: run once — builds the Google Form and its spreadsheet
// ----------------------------------------------------------------
function createForm() {
  var form = FormApp.create(FORM_TITLE);
  form.setDescription("Log every Upwork application in under 30 seconds. / 応募のたびに30秒で記録。");

  var numberOnly = FormApp.createTextValidation().requireNumber().build();

  form.addTextItem().setTitle("Job Title / 案件名").setRequired(true);
  form.addTextItem().setTitle("Job URL / 案件URL");
  form.addTextItem().setTitle("Client Name / クライアント名");
  form.addTextItem().setTitle("Budget USD / 予算（ドル）").setValidation(numberOnly);
  form.addMultipleChoiceItem().setTitle("Job Type / 案件種別").setChoiceValues(["Fixed", "Hourly"]);
  form.addTextItem().setTitle("Connects Used / 使用Connects").setValidation(numberOnly);
  form.addParagraphTextItem().setTitle("Notes / メモ");

  var ss = SpreadsheetApp.create("Upwork Application Tracker");
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  Logger.log("Form (edit)   : " + form.getEditUrl());
  Logger.log("Form (submit) : " + form.getPublishedUrl());
  Logger.log("Spreadsheet   : " + ss.getUrl());
  Logger.log("Spreadsheet ID: " + ss.getId());
  Logger.log("NEXT: paste the Spreadsheet ID into SPREADSHEET_ID at the top of this file.");
}

// ----------------------------------------------------------------
// onFormSubmit: triggered automatically on each form submission
// ----------------------------------------------------------------
function onFormSubmit(e) {
  var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(RESPONSES_SHEET) || ss.getSheets()[0];

  ensureTrackingHeaders(sheet);

  // Forms inserts responses at its own row index (not always the last row,
  // e.g. when rows were added manually) — trust e.range when available.
  var row = (e && e.range) ? e.range.getRow() : sheet.getLastRow();
  var statusCell = sheet.getRange(row, STATUS_COL);
  statusCell.setValue("Applied");
  statusCell.setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(STATUS_OPTIONS, true).build()
  );
}

// ----------------------------------------------------------------
// ensureTrackingHeaders: add Status / Earned USD headers if missing
// ----------------------------------------------------------------
function ensureTrackingHeaders(sheet) {
  if (sheet.getRange(1, STATUS_COL).getValue() === "") {
    sheet.getRange(1, STATUS_COL).setValue("Status").setFontWeight("bold");
  }
  if (sheet.getRange(1, EARNED_COL).getValue() === "") {
    sheet.getRange(1, EARNED_COL).setValue("Earned USD").setFontWeight("bold");
  }
}

// ----------------------------------------------------------------
// setupDashboard: run once — builds the formula-driven Dashboard
// ----------------------------------------------------------------
function setupDashboard() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  ensureTrackingHeaders(ss.getSheetByName(RESPONSES_SHEET) || ss.getSheets()[0]);

  var sheet = ss.getSheetByName(DASHBOARD_SHEET) || ss.insertSheet(DASHBOARD_SHEET);
  sheet.clear();

  var R = "'" + RESPONSES_SHEET + "'!";

  sheet.getRange("A1").setValue("Upwork Application Tracker — Dashboard").setFontWeight("bold").setFontSize(14);

  // --- Application KPIs ---
  // Full-column references (A:A, not A2:A): Forms inserts new responses at
  // the top of the data block, which silently shifts open ranges like A2:A.
  var kpis = [
    ["Total Applications",       "=COUNTA(" + R + "A:A)-1"],
    ["Applications This Month",  "=COUNTIFS(" + R + "A:A,\">=\"&(EOMONTH(TODAY(),-1)+1)," + R + "A:A,\"<\"&(EOMONTH(TODAY(),0)+1))"],
    ["Reply Rate",               "=IFERROR((COUNTIF(" + R + "I:I,\"Replied\")+COUNTIF(" + R + "I:I,\"Interview\")+COUNTIF(" + R + "I:I,\"Hired\"))/(COUNTA(" + R + "A:A)-1),0)"],
    ["Hire Rate",                "=IFERROR(COUNTIF(" + R + "I:I,\"Hired\")/(COUNTA(" + R + "A:A)-1),0)"],
    ["Average Budget (USD)",     "=IFERROR(AVERAGE(" + R + "E:E),0)"],
    ["Total Connects Used",      "=SUM(" + R + "G:G)"]
  ];
  writeFormulaRows(sheet, 3, kpis);
  sheet.getRange("B5:B6").setNumberFormat("0.0%");
  sheet.getRange("B7").setNumberFormat("$#,##0.00");

  // --- Money summary ---
  sheet.getRange("A10").setValue("Money Summary").setFontWeight("bold");
  var money = [
    ["Total Earned (USD)",   "=SUM(" + R + "J:J)"],
    ["Connects Cost (USD)",  "=SUM(" + R + "G:G)*" + CONNECT_COST_USD],
    ["Net (USD)",            "=B11-B12"]
  ];
  writeFormulaRows(sheet, 11, money);
  sheet.getRange("B11:B13").setNumberFormat("$#,##0.00");

  // --- Status breakdown ---
  sheet.getRange("A15").setValue("Status Breakdown").setFontWeight("bold");
  var breakdown = STATUS_OPTIONS.map(function(status) {
    return [status, "=COUNTIF(" + R + "I:I,\"" + status + "\")"];
  });
  writeFormulaRows(sheet, 16, breakdown);

  // --- Monthly trend (last 6 months, newest first) ---
  sheet.getRange("A23").setValue("Monthly (last 6 months)").setFontWeight("bold");
  sheet.getRange("A24:C24").setValues([["Month", "Applications", "Earned (USD)"]]).setFontWeight("bold");
  for (var i = 0; i < 6; i++) {
    var row      = 25 + i;
    var monthGte = "\">=\"&(EOMONTH(TODAY(),-" + (i + 1) + ")+1)";
    var monthLt  = "\"<\"&(EOMONTH(TODAY(),-" + i + ")+1)";
    sheet.getRange(row, 1).setFormula("=TEXT(EOMONTH(TODAY(),-" + i + "),\"YYYY-MM\")");
    sheet.getRange(row, 2).setFormula(
      "=COUNTIFS(" + R + "A:A," + monthGte + "," + R + "A:A," + monthLt + ")");
    sheet.getRange(row, 3).setFormula(
      "=SUMIFS(" + R + "J:J," + R + "A:A," + monthGte + "," + R + "A:A," + monthLt + ")");
  }
  sheet.getRange("C25:C30").setNumberFormat("$#,##0.00");

  sheet.setColumnWidth(1, 220);
  sheet.setColumnWidth(2, 130);
  sheet.setColumnWidth(3, 130);

  Logger.log("Dashboard created: " + ss.getUrl());
}

// ----------------------------------------------------------------
// writeFormulaRows: helper — [label, formula] pairs from startRow
// ----------------------------------------------------------------
function writeFormulaRows(sheet, startRow, rows) {
  for (var i = 0; i < rows.length; i++) {
    sheet.getRange(startRow + i, 1).setValue(rows[i][0]);
    sheet.getRange(startRow + i, 2).setFormula(rows[i][1]);
  }
}

// ----------------------------------------------------------------
// setupTrigger: run once manually to register the form-submit trigger
// ----------------------------------------------------------------
function setupTrigger() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // Remove existing triggers to avoid duplicates
  ScriptApp.getProjectTriggers().forEach(function(trigger) {
    if (trigger.getHandlerFunction() === "onFormSubmit") {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  ScriptApp.newTrigger("onFormSubmit")
    .forSpreadsheet(ss)
    .onFormSubmit()
    .create();

  Logger.log("Trigger registered: " + ss.getName());
}

// ----------------------------------------------------------------
// testSetup: insert 3 dummy applications to verify the pipeline
// ----------------------------------------------------------------
function testSetup() {
  var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(RESPONSES_SHEET) || ss.getSheets()[0];

  var dummies = [
    ["Build a Slack bot for order alerts",   "https://www.upwork.com/jobs/~dummy1", "Acme Corp",  500, "Fixed",  12, "dummy row"],
    ["Automate weekly KPI report with GAS",  "https://www.upwork.com/jobs/~dummy2", "Globex LLC", 300, "Fixed",   8, "dummy row"],
    ["n8n workflow: CRM to email sync",      "https://www.upwork.com/jobs/~dummy3", "Initech",     45, "Hourly", 16, "dummy row"]
  ];

  dummies.forEach(function(row) {
    sheet.appendRow([new Date()].concat(row));
    onFormSubmit({});
  });

  // Simulate later status updates so the Dashboard shows real variety
  var lastRow = sheet.getLastRow();
  sheet.getRange(lastRow - 1, STATUS_COL).setValue("Replied");
  sheet.getRange(lastRow, STATUS_COL).setValue("Hired");
  sheet.getRange(lastRow, EARNED_COL).setValue(360);

  Logger.log("Inserted 3 dummy applications: Applied / Replied / Hired ($360 earned).");
}
