/* Inspection Log page — every check as one row, filterable + sortable */

function LogPage(){
  const QC = window.QC;
  const [q, setQ] = React.useState('');
  const [block, setBlock] = React.useState('All');
  const [cat, setCat] = React.useState('All');
  const [status, setStatus] = React.useState('All');
  const [sort, setSort] = React.useState({ key:'ts', dir:-1 });

  const statuses = ['OK','NOT OK','Pending','N/A'];

  let rows = QC.log.filter(r =>
    (block==='All' || r.block===block) &&
    (cat==='All'   || r.cat===cat) &&
    (status==='All'|| r.status===status) &&
    (!q.trim() || (r.inspector+' '+r.itemId+' '+r.check+' '+r.flat+' '+r.cat).toLowerCase().includes(q.toLowerCase()))
  );

  rows = [...rows].sort((a,b) => {
    let av=a[sort.key], bv=b[sort.key];
    if(sort.key==='block'){ av=+av; bv=+bv; }
    if(av<bv) return -1*sort.dir; if(av>bv) return 1*sort.dir; return 0;
  });

  const toggleSort = (key) => setSort(s => s.key===key ? { key, dir:-s.dir } : { key, dir:1 });
  const SortTh = ({ k, children, cls }) => (
    <th className={(cls||'') + " qc-th-sort"} onClick={() => toggleSort(k)}>
      {children}<span className="qc-sort-arrow">{sort.key===k ? (sort.dir>0?'▲':'▼') : ''}</span>
    </th>
  );

  const st = qcStat(rows);

  return (
    <div className="qc-page">
      <Card className="qc-table-card">
        <SectionTitle kicker="EVERY CHECK · ONE ROW" title="Inspection Log"
          right={<span className="qc-scope-count">{rows.length} of {QC.log.length} rows</span>} />
        <p className="qc-page-note">The system of record. Every check from every submission lands here — the Console reads from this log, so its numbers update the moment a row is added.</p>

        <div className="qc-toolbar qc-toolbar-wrap">
          <input className="qc-search" placeholder="Search check, item ID, inspector…" value={q} onChange={e => setQ(e.target.value)} />
          <label className="qc-field qc-field-inline"><span className="qc-field-label">Block</span>
            <select className="qc-select" value={block} onChange={e => setBlock(e.target.value)}>
              <option>All</option>{QC.blocks.map(b => <option key={b}>{b}</option>)}
            </select></label>
          <label className="qc-field qc-field-inline"><span className="qc-field-label">Category</span>
            <select className="qc-select" value={cat} onChange={e => setCat(e.target.value)}>
              <option>All</option>{QC.categories.map(c => <option key={c}>{c}</option>)}
            </select></label>
          <label className="qc-field qc-field-inline"><span className="qc-field-label">Status</span>
            <select className="qc-select" value={status} onChange={e => setStatus(e.target.value)}>
              <option>All</option>{statuses.map(s => <option key={s}>{s}</option>)}
            </select></label>
          {(q||block!=='All'||cat!=='All'||status!=='All') &&
            <button className="qc-clear" onClick={() => { setQ(''); setBlock('All'); setCat('All'); setStatus('All'); }}>Reset</button>}
        </div>

        <div className="qc-log-tally">
          <span>{st.checks} shown</span><span className="qc-dot-sep">•</span>
          <span style={{color:'#16855A'}}>{st.ok} OK</span><span className="qc-dot-sep">•</span>
          <span style={{color:'#C83232'}}>{st.notok} NOT OK</span><span className="qc-dot-sep">•</span>
          <span style={{color:'#E08600'}}>{st.open} open</span><span className="qc-dot-sep">•</span>
          <span>Pass {fmtPct(st.pass)}</span>
        </div>

        {rows.length === 0 ? (
          <EmptyState icon="∅" title="No matching log rows" sub="Adjust the filters above to widen your search." />
        ) : (
          <div className="qc-table-scroll qc-log-scroll">
            <table className="qc-table qc-table-log">
              <thead><tr>
                <SortTh k="ts">Date</SortTh>
                <SortTh k="inspector">Inspector</SortTh>
                <SortTh k="block" cls="qc-th-num">Block</SortTh>
                <th>Floor</th><th>Flat</th>
                <SortTh k="cat">Category</SortTh>
                <SortTh k="itemId">Item ID</SortTh>
                <th className="qc-th-check">Inspection Check</th>
                <SortTh k="status">Status</SortTh>
                <th>Rectified</th><th>Remarks</th>
              </tr></thead>
              <tbody>
                {rows.map((r,i) => (
                  <tr key={i}>
                    <td className="qc-nowrap qc-muted">{fmtDateShort(r.ts)}</td>
                    <td className="qc-strong">{r.inspector}</td>
                    <td className="qc-td-num qc-mono">{r.block}</td>
                    <td>{r.floor}</td><td>{r.flat}</td>
                    <td className="qc-nowrap">{r.cat}</td>
                    <td className="qc-mono qc-id">{r.itemId}</td>
                    <td className="qc-th-check">{r.check}</td>
                    <td><StatusBadge status={r.status} /></td>
                    <td>{r.rectified ? <span className="qc-rect-yes">{r.rectified}</span> : <span className="qc-muted">—</span>}</td>
                    <td className="qc-remarks">{r.remarks || <span className="qc-muted">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

Object.assign(window, { LogPage });
