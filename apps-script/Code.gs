// Receives results from the dinner_request page: appends a row to this Google Sheet and emails the owner.
//
// Setup (once):
//   1. Create a Google Sheet, then Extensions → Apps Script, and paste this file in.
//   2. Deploy → New deployment → type "Web app"; Execute as: Me; Who has access: Anyone.
//   3. Approve the permissions, then copy the Web app URL (ends in /exec) into CONFIG.resultUrl in script.js.
// After editing this file: Deploy → Manage deployments → edit → Version: New version (the URL stays the same).

// The URL is public, so treat every field as untrusted: cap its length and stop formula injection
const clean = v => {
  const s = String(v ?? '').slice(0, 200);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
};

function doPost(e) {
  const d = JSON.parse(e.postData.contents);
  const [date, time, food] = [d.date, d.time, d.food].map(clean);
  SpreadsheetApp.getActiveSpreadsheet().getSheets()[0].appendRow([new Date(), date, time, food]);
  MailApp.sendEmail(
    Session.getEffectiveUser().getEmail(),
    '約會邀請：佢答應咗 ♥',
    `日期：${date}\n時間：${time}\n想食：${food}`
  );
  return ContentService.createTextOutput('ok');
}
