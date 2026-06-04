/****************************************************************************
 * JAIN GROUP — QC  ·  Inspection Log Sync
 * --------------------------------------------------------------------------
 * Rebuilds the "Inspection Log" sheet from "Form Responses 7" on every form
 * submit AND every response edit, so editing a response UPDATES rows in place
 * instead of appending a duplicate block.
 *
 *  Initial 7 rows  ->  edit NOT OK to OK  ->  still 7 rows, values changed.
 *
 * SETUP (one time):
 *   1. In the Google Sheet:  Extensions -> Apps Script
 *   2. Paste this file (you can keep it alongside your existing code, but make
 *      sure the OLD "on form submit" trigger that APPENDS to Inspection Log is
 *      removed — step 4 does this for you).
 *   3. Pick the function  installLogSyncTrigger  in the toolbar and click Run.
 *      Approve the permission prompt.
 *   4. installLogSyncTrigger removes every existing on-form-submit trigger and
 *      installs this one, so the old appending behaviour stops.
 *   5. (Optional) Run  rebuildInspectionLog  once now to clean up the current
 *      doubled-up log immediately.
 *
 * NOTE: the Inspection Log becomes a derived view of Form Responses 7. Manual
 * edits typed directly into the Inspection Log (e.g. a hand-set Rectified?)
 * will be overwritten on the next submit — do rectifications via the form.
 ****************************************************************************/

var FORM_SHEET = "Form Responses 8";
var LOG_SHEET  = "Inspection Log";
var LOG_HEADERS = ["Timestamp","Inspector","Block","Floor","Flat","Work Category",
                   "Item ID","Inspection Check","Status","Defect Photo",
                   "Rectified?","Rectified Photo","Remarks","FlatKey"];

/* Rebuild the whole Inspection Log from the current Form Responses. */
function rebuildInspectionLog() {
  var ss = SpreadsheetApp.getActive();
  var fs = ss.getSheetByName(FORM_SHEET);
  if (!fs) throw new Error("Sheet not found: " + FORM_SHEET);

  var values = fs.getDataRange().getValues();
  if (values.length < 2) { writeLog_(ss, []); return; }

  var headers = values[0].map(function (h) { return String(h).trim(); });

  function col(name) {
    for (var i = 0; i < headers.length; i++) if (headers[i] === name) return i;
    return -1;
  }
  var cT  = col("Timestamp");
  var cI  = col("Inspector Name");
  var cB  = col("Block");
  var cF  = col("Floor");
  var cFl = col("Flat");
  var cW  = col("Work Category");

  var cOverall = -1;
  for (var h = 0; h < headers.length; h++) {
    if (/overall site remarks/i.test(headers[h])) { cOverall = h; break; }
  }

  // item columns look like:  RCC Work || Checklist [RCC-001 — Dimensions...]
  var ID_RE = /\[([A-Za-z]{2,4}-\d{2,4})\s*[—\-]\s*([\s\S]*?)\]\s*$/;
  var itemCols = [];
  for (var k = 0; k < headers.length; k++) {
    var m = ID_RE.exec(headers[k]);
    if (m) itemCols.push({ idx: k, id: m[1], check: String(m[2]).trim() });
  }

  // latest result wins per Block+Floor+Flat+Category+Item, so re-submissions
  // and edits never grow the log — they just change the value.
  var best = {};   // key -> row array
  var order = [];  // preserve first-seen order

  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    var cat = String(row[cW] || "").trim();
    var inspector = String(row[cI] || "").trim();
    if (!inspector && !cat) continue;

    var block = numClean_(row[cB]);
    var floor = numClean_(row[cF]);
    var flat  = String(row[cFl] || "").trim();
    var ts    = row[cT];
    var tsNum = (ts instanceof Date) ? ts.getTime() : (Date.parse(String(ts)) || 0);

    var parts = [];
    for (var s = 0; s < headers.length; s++) {
      if (/section remarks/i.test(headers[s]) && cat && headers[s].indexOf(cat) !== -1) {
        var sv = String(row[s] || "").trim();
        if (sv) parts.push(sv);
      }
    }
    if (cOverall >= 0) {
      var ov = String(row[cOverall] || "").trim();
      if (ov) parts.push(ov);
    }
    var remarks = parts.join(" | ");
    var flatKey = "B" + block + "-" + floor + "-" + flat;

    for (var c = 0; c < itemCols.length; c++) {
      var val = String(row[itemCols[c].idx] || "").trim();
      if (!val) continue;
      var key = block + "|" + floor + "|" + flat + "|" + cat + "|" + itemCols[c].id;
      var rowOut = [ ts, inspector, block, floor, flat, cat,
                     itemCols[c].id, itemCols[c].check, val,
                     "", "", "", remarks, flatKey ];
      var prev = best[key];
      if (!prev) { best[key] = { ts: tsNum, row: rowOut }; order.push(key); }
      else if (tsNum >= prev.ts) { best[key] = { ts: tsNum, row: rowOut }; }
    }
  }

  var out = order.map(function (k) { return best[k].row; });
  writeLog_(ss, out);
}

function writeLog_(ss, rows) {
  var sh = ss.getSheetByName(LOG_SHEET) || ss.insertSheet(LOG_SHEET);
  sh.clearContents();
  sh.getRange(1, 1, 1, LOG_HEADERS.length).setValues([LOG_HEADERS]);
  if (rows.length) sh.getRange(2, 1, rows.length, LOG_HEADERS.length).setValues(rows);
}

function numClean_(v) {
  var s = (v == null ? "" : String(v)).trim();
  return /^\d+\.0+$/.test(s) ? String(parseInt(s, 10)) : s;
}

/* Run ONCE. Clears old on-form-submit triggers and installs the rebuild,
   so submits AND edits keep the Inspection Log in sync (no duplicates). */
function installLogSyncTrigger() {
  var ss = SpreadsheetApp.getActive();
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getEventType && t.getEventType() === ScriptApp.EventType.ON_FORM_SUBMIT) {
      ScriptApp.deleteTrigger(t);
    }
  });
  ScriptApp.newTrigger("rebuildInspectionLog")
           .forSpreadsheet(ss)
           .onFormSubmit()
           .create();
  rebuildInspectionLog(); // clean up immediately
}
