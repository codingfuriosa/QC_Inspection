/* Setup & Sync Guide page */

function GuideSection({ no, title, children }){
  return (
    <Card className="qc-guide-card">
      <div className="qc-guide-head">
        <span className="qc-guide-no">{no}</span>
        <h2 className="qc-guide-title">{title}</h2>
      </div>
      <div className="qc-guide-body">{children}</div>
    </Card>
  );
}
function Step({ n, children }){
  return <li className="qc-step"><span className="qc-step-n">{n}</span><span className="qc-step-t">{children}</span></li>;
}

function GuidePage(){
  return (
    <div className="qc-page qc-guide">
      <div className="qc-guide-hero">
        <div className="qc-kicker">JAIN GROUP · QUALITY CONTROL</div>
        <h1 className="qc-guide-hero-title">Setup &amp; Sync Guide</h1>
        <p className="qc-guide-hero-sub">Mobile field inspection · live console · Excel + Google Sheets · cloud + intranet</p>
        <div className="qc-guide-lead">
          Supervisors inspect from their phone via a Google Form. Every submit updates the Console instantly —
          flat-wise, block-wise, floor-wise and work-wise.
        </div>
      </div>

      <div className="qc-guide-grid">
        <GuideSection no="1" title="How a supervisor inspects (on the phone)">
          <ol className="qc-steps">
            <Step n="1">Open the inspection link (share on WhatsApp or save to the phone home screen).</Step>
            <Step n="2">Enter name, then pick Block, Floor and Flat from drop-downs.</Step>
            <Step n="3">Pick the work being inspected (e.g. Tile Work) — the form jumps to <b>only</b> that checklist.</Step>
            <Step n="4">Tap OK / NOT OK / N/A for each check. Most take a few seconds.</Step>
            <Step n="5">On the last page, for every NOT OK item snap a photo and name the file with the check ID (e.g. <span className="qc-mono">TIL-005</span>).</Step>
            <Step n="6">Press Submit. Done — it appears on the Console immediately.</Step>
          </ol>
        </GuideSection>

        <GuideSection no="2" title="One-time setup (~10 minutes, do once)">
          <ol className="qc-steps qc-steps-alpha">
            <Step n="A">Put this workbook in Google Sheets: upload the .xlsx to Drive → right-click → Open with → Google Sheets.</Step>
            <Step n="B">In the Sheet: Extensions → Apps Script. Delete the sample code, paste <span className="qc-mono">JainGroup_QC_FormBuilder.gs</span>, and Save.</Step>
            <Step n="C">Choose the function <span className="qc-mono">buildInspectionForm</span> and Run. Approve the prompt — it builds the whole form and prints the links in View → Logs.</Step>
            <Step n="D">Open the form's EDIT link → last page "Photos &amp; Submit" → Add question → File upload → title it exactly: <i>Defect photos (name each file with its check ID)</i> → allow multiple files.</Step>
            <Step n="E">Back in Apps Script, run <span className="qc-mono">installTrigger</span> once (this makes submissions flow into the Inspection Log).</Step>
            <Step n="F">Press the form's SEND button → link icon → copy the live link and share it with your supervisors.</Step>
          </ol>
        </GuideSection>

        <GuideSection no="3" title="The Console (your monitoring dashboard)">
          <ul className="qc-bullets">
            <li>Live KPI cards: checks logged, OK, defects, open defects, rectified, pass rate.</li>
            <li><b>Drill-down:</b> pick any Block / Floor / Flat / Work Type (or "All") to see that scope's result instantly.</li>
            <li>Tables by Block and by Work Category, plus an Open Defects list with photo links.</li>
            <li>The Inspection Log holds every check (one row each) — the Console reads from it.</li>
            <li>To close a defect: set <span className="qc-mono">Rectified? = Yes</span> in the Log (and paste the after-photo). The Open count drops automatically.</li>
          </ul>
        </GuideSection>

        <GuideSection no="4" title="Works in Excel &amp; Google Sheets">
          <p>The form + auto-sync run in Google Sheets (that is where Google Forms live). The workbook itself — every sheet, colour-coding, drop-down and the Console formulas — also opens in Microsoft Excel for offline viewing/printing.</p>
          <p className="qc-note-inline"><b>Note:</b> the Open Defects list uses the FILTER function (Google Sheets and Excel 365). KPI cards and the By-Block / By-Category tables work in every version.</p>
        </GuideSection>

        <GuideSection no="5" title="Sync via cloud">
          <ul className="qc-bullets">
            <li><b>Google Workspace (recommended — the form needs it):</b> keep the Sheet in a shared Drive folder; it syncs and co-edits in real time. Defect photos save automatically to your Drive.</li>
            <li><b>Microsoft 365:</b> for offline/Excel use, store the .xlsx on OneDrive/SharePoint with AutoSave on for co-authoring and version history.</li>
          </ul>
        </GuideSection>

        <GuideSection no="6" title="Sync via intranet">
          <p>Place the workbook on a mapped network drive / shared folder (e.g. <span className="qc-mono">\\jaingroup-server\QC\</span>) with read-write access for the QC team; on-prem SharePoint works like the cloud option. Keep exported photos in a sub-folder beside it so links resolve across the intranet. Cloud (Section 5) is preferred for live multi-user editing.</p>
        </GuideSection>

        <GuideSection no="7" title="Good practice">
          <ul className="qc-bullets">
            <li>Do not delete CONFIG (drop-downs) or rename the Master Checklist / Inspection Log / Console sheets — the script and formulas rely on those names.</li>
            <li>Add or edit checks on the Master Checklist, then re-run <span className="qc-mono">buildInspectionForm</span> to refresh the form.</li>
            <li>Keep one master copy as the source of truth once it is on cloud / intranet.</li>
          </ul>
        </GuideSection>
      </div>
    </div>
  );
}

Object.assign(window, { GuidePage });
