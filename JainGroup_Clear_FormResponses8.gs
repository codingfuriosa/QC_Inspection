/****************************************************************************
 * JAIN GROUP — QC  ·  Clear Form Responses 8 (fresh start)
 * --------------------------------------------------------------------------
 * Deletes every DATA row in "Form Responses 8" but keeps the header row,
 * so the dashboard starts from zero and fills only from new submissions.
 *
 * HOW TO RUN (one time):
 *   1. Open the sheet:  Extensions -> Apps Script
 *   2. Paste this file.
 *   3. In the toolbar pick  clearFormResponses8  and click Run. Approve the
 *      permission prompt. Done — refresh the dashboard (give Google ~5 min
 *      for its feed cache).
 *
 * NOTE: this clears the linked form-response data permanently. The form keeps
 * working; new submissions land in the (now empty) tab as usual.
 ****************************************************************************/

var FORM_SHEET = "Form Responses 8";

function clearFormResponses8() {
  var ss = SpreadsheetApp.getActive();
  var sh = ss.getSheetByName(FORM_SHEET);
  if (!sh) throw new Error("Sheet not found: " + FORM_SHEET);

  var last = sh.getLastRow();
  if (last > 1) {
    // delete rows 2..last (keep the header in row 1)
    sh.deleteRows(2, last - 1);
  }
  SpreadsheetApp.getActive().toast("Form Responses 8 cleared — header kept.", "QC", 5);
}
