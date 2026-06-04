/* Form Responses page — read-only submissions table + per-submission detail */

function respStat(answers){
  const ok = answers.filter(a => a.value === 'OK').length;
  const notok = answers.filter(a => a.value === 'NOT OK').length;
  const na = answers.filter(a => a.value === 'N/A').length;
  return { ok, notok, na, total: answers.length };
}

function ResponseDetail({ resp, index, onBack }){
  const st = respStat(resp.answers);
  return (
    <div className="qc-drill">
      <button className="qc-back" onClick={onBack}><span aria-hidden="true">←</span> Back to Form Responses</button>
      <div className="qc-resp-detail-head">
        <div className="qc-resp-id">SUBMISSION #{String(index+1).padStart(3,'0')}</div>
        <h1 className="qc-drill-title">{resp.cat}</h1>
        <div className="qc-resp-facts">
          <Fact label="Inspector" value={resp.inspector} />
          <Fact label="Block" value={resp.block} />
          <Fact label="Floor" value={resp.floor} />
          <Fact label="Flat" value={resp.flat} />
          <Fact label="Submitted" value={fmtDate(resp.ts)} />
        </div>
        <div className="qc-resp-tally">
          <span className="qc-tally qc-tally-ok">{st.ok} OK</span>
          <span className="qc-tally qc-tally-no">{st.notok} NOT OK</span>
          {st.na>0 && <span className="qc-tally qc-tally-na">{st.na} N/A</span>}
          <span className="qc-tally-total">{st.total} checks answered</span>
        </div>
      </div>

      {(resp.sectionRemark || resp.overallRemark || resp.photo) && (
        <Card className="qc-resp-notes">
          {resp.sectionRemark && (
            <div className="qc-note">
              <span className="qc-note-label">Section Remark · {resp.cat}</span>
              <span className="qc-note-text">{resp.sectionRemark}</span>
            </div>
          )}
          {resp.overallRemark && (
            <div className="qc-note">
              <span className="qc-note-label">Overall Site Remark</span>
              <span className="qc-note-text">{resp.overallRemark}</span>
            </div>
          )}
          {resp.photo && (
            <div className="qc-note">
              <span className="qc-note-label">Defect Photos</span>
              <span className="qc-note-text qc-photo-links">
                {resp.photo.split(/[\s,]+/).filter(Boolean).map((u,i) => (
                  <a key={i} className="qc-photo-link" href={u} target="_blank" rel="noopener noreferrer">📷 Photo {i+1} ↗</a>
                ))}
              </span>
            </div>
          )}
        </Card>
      )}

      <Card className="qc-table-card">
        <div className="qc-table-scroll">
          <table className="qc-table">
            <thead><tr><th className="qc-th-num2">#</th><th>Item ID</th><th className="qc-th-check">Inspection Check</th><th>Response</th></tr></thead>
            <tbody>
              {resp.answers.map((a,i) => (
                <tr key={i}>
                  <td className="qc-mono qc-muted">{i+1}</td>
                  <td className="qc-mono qc-id">{a.itemId || '—'}</td>
                  <td className="qc-th-check">{a.check}</td>
                  <td><StatusBadge status={a.value} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Fact({ label, value }){
  return (
    <div className="qc-fact">
      <span className="qc-fact-label">{label}</span>
      <span className="qc-fact-value">{value || '—'}</span>
    </div>
  );
}

function ResponsesPage(){
  const QC = window.QC;
  const [open, setOpen] = React.useState(null);
  const [q, setQ] = React.useState('');
  const [cat, setCat] = React.useState('All');

  if(open != null){
    return <ResponseDetail resp={QC.responses[open]} index={open} onBack={() => setOpen(null)} />;
  }

  const rows = QC.responses
    .map((r,i) => ({ r, i }))
    .filter(({r}) => cat==='All' || r.cat===cat)
    .filter(({r}) => {
      if(!q.trim()) return true;
      const t = (r.inspector+' '+r.cat+' '+r.block+' '+r.flat).toLowerCase();
      return t.includes(q.toLowerCase());
    });

  return (
    <div className="qc-page">
      <Card className="qc-table-card">
        <SectionTitle kicker="GOOGLE FORM" title="Form Responses"
          right={<span className="qc-scope-count">{QC.responses.length} submissions</span>} />
        <p className="qc-page-note">Read-only mirror of the live inspection form. Each row is one supervisor submission; open any row to see every check and its OK / NOT OK response.</p>

        <div className="qc-toolbar">
          <input className="qc-search" placeholder="Search inspector, block, flat…" value={q} onChange={e => setQ(e.target.value)} />
          <label className="qc-field qc-field-inline">
            <span className="qc-field-label">Work Type</span>
            <select className="qc-select" value={cat} onChange={e => setCat(e.target.value)}>
              <option value="All">All</option>
              {QC.categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
        </div>

        {rows.length === 0 ? (
          <EmptyState icon="∅" title="No submissions match" sub="Try a different search term or work type." />
        ) : (
          <div className="qc-table-scroll">
            <table className="qc-table qc-table-rows">
              <thead><tr>
                <th>Submitted</th><th>Inspector</th><th>Block</th><th>Floor</th><th>Flat</th>
                <th>Work Category</th><th className="qc-th-num">OK</th><th className="qc-th-num">NOT&nbsp;OK</th>
                <th className="qc-th-num">Answered</th><th></th>
              </tr></thead>
              <tbody>
                {rows.map(({r,i}) => {
                  const st = respStat(r.answers);
                  return (
                    <tr key={i} className="qc-row-click" onClick={() => { setOpen(i); window.scrollTo(0,0); }}>
                      <td className="qc-nowrap">{fmtDateShort(r.ts)}</td>
                      <td className="qc-strong">{r.inspector}</td>
                      <td className="qc-mono">{r.block}</td>
                      <td>{r.floor}</td>
                      <td>{r.flat}</td>
                      <td>{r.cat}</td>
                      <td className="qc-td-num"><span className="qc-num-ok">{st.ok}</span></td>
                      <td className="qc-td-num"><span className={st.notok? "qc-num-no":"qc-num-muted"}>{st.notok}</span></td>
                      <td className="qc-td-num qc-muted">{st.total}</td>
                      <td className="qc-td-chev">›</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

Object.assign(window, { ResponsesPage });
