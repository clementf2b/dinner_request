// Receives results from the dinner_request page and appends a row to this Google Sheet.
//
// Setup (once):
//   1. Create a Google Sheet, then Extensions → Apps Script, and paste this file in.
//   2. Deploy → New deployment → type "Web app"; Execute as: Me; Who has access: Anyone.
//   3. Approve the permissions, then copy the Web app URL (ends in /exec) into CONFIG.resultUrl in script.js.
// After editing this file: Deploy → Manage deployments → edit → Version: New version (the URL stays the same).

// The URL is public, so only accept what the page can send: letters (incl. Chinese), digits, 、 and （）, max 40 chars.
// That rules out spreadsheet formulas (no = + - @ or ASCII brackets) and junk like URLs or long text.
const SAFE = /^[\p{L}\p{N}、（）]{1,40}$/u;

function doPost(e) {
  const d = JSON.parse(e.postData.contents);
  const row = [d.date, d.time, d.food];
  if (!row.every(v => typeof v === 'string' && SAFE.test(v))) return ContentService.createTextOutput('rejected');
  SpreadsheetApp.getActiveSpreadsheet().getSheets()[0].appendRow([new Date(), ...row]);
  return ContentService.createTextOutput('ok');
}
