/* Console / Dashboard page + clickable drill-down detail views */

function colFilter(rows, col){
  if(col === 'checks') return rows;
  if(col === 'ok')     return rows.filter(r => r.status === 'OK');
  if(col === 'notok')  return rows.filter(r => r.status === 'NOT OK');
  if(col === 'open')   return rows.filter(r => r.status === 'NOT OK' && String(r.rectified||'').toLowerCase() !== 'yes');
  return rows;
}
const COL_LABEL = { checks:'All Checks', ok:'OK', notok:'NOT OK', open:'Open Defects' };

/* ---- a clickable number cell in the matrix tables ---- */
function CellNum({ n, col, onOpen, dim, dkey }){
  const zero = !n;
  const cls = "qc-cell-num qc-cell-" + col + (zero ? " is-zero" : "");
  return (
    <td className="qc-td-num">
      <button className={cls} onClick={() => onOpen(dim, dkey, col)} title={`View ${COL_LABEL[col]}`}>
        {n}
      </button>
    </td>
  );
}

/* ---- drill detail page ---- */
function DrillDetail({ dim, dkey, col, onBack }){
  const QC = window.QC;
  let base = QC.log.filter(r => dim === 'block' ? r.block === dkey : r.cat === dkey);
  const rows = colFilter(base, col);
  const scopeLabel = dim === 'block' ? ('Block ' + dkey) : dkey;
  const s = qcStat(base);

  return (
    <div className="qc-drill">
      <button className="qc-back" onClick={onBack}>
        <span aria-hidden="true">←</span> Back to Console
      </button>

      <div className="qc-drill-head">
        <div className="qc-drill-crumbs">
          <span className="qc-crumb-dim">{dim === 'block' ? 'BY BLOCK' : 'BY WORK CATEGORY'}</span>
          <span className="qc-crumb-sep">/</span>
          <span className="qc-crumb-scope">{scopeLabel}</span>
          <span className="qc-crumb-sep">/</span>
          <span className={"qc-crumb-col qc-crumb-" + col}>{COL_LABEL[col]}</span>
        </div>
        <h1 className="qc-drill-title">{scopeLabel} · {COL_LABEL[col]}</h1>
        <div className="qc-drill-meta">
          <span><b>{rows.length}</b> record{rows.length===1?'':'s'}</span>
          <span className="qc-dot-sep">•</span>
          <span>Scope total: {s.checks} checks · {s.ok} OK · {s.notok} NOT OK · {s.open} open</span>
        </div>
      </div>

      {rows.length === 0 ? (
        <Card className="qc-drill-empty">
          <EmptyState
            icon="∅"
            title="No records for this selection"
            sub={`There are no ${COL_LABEL[col].toLowerCase()} entries logged for ${scopeLabel} yet. As supervisors submit inspections from the field, matching checks will appear here automatically.`}
          />
        </Card>
      ) : (
        <Card className="qc-table-card">
          <div className="qc-table-scroll">
            <table className="qc-table qc-table-drill">
              <thead>
                <tr>
                  <th>Block</th><th>Floor</th><th>Flat</th>
                  {dim === 'block' && <th>Category</th>}
                  <th>Item ID</th><th className="qc-th-check">Inspection Check</th>
                  <th>Status</th><th>Inspector</th><th>Date</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r,i) => (
                  <tr key={i}>
                    <td className="qc-mono">{r.block}</td>
                    <td>{r.floor}</td>
                    <td>{r.flat}</td>
                    {dim === 'block' && <td>{r.cat}</td>}
                    <td className="qc-mono qc-id">{r.itemId}</td>
                    <td className="qc-th-check">{r.check}</td>
                    <td><StatusBadge status={r.status} /></td>
                    <td>{r.inspector}</td>
                    <td className="qc-nowrap">{fmtDateShort(r.ts)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

/* ---- drill-down scope selector ---- */
function ScopePicker({ scope, setScope }){
  const QC = window.QC;
  const opt = (arr) => ['All', ...arr];
  const sel = (key, options) => (
    <label className="qc-field">
      <span className="qc-field-label">{key[0].toUpperCase()+key.slice(1)}</span>
      <select className="qc-select" value={scope[key]} onChange={e => setScope({ ...scope, [key]: e.target.value })}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
  return (
    <div className="qc-scope-row">
      {sel('block', opt(QC.blocks))}
      {sel('floor', opt(QC.floors))}
      {sel('flat',  opt(QC.flats))}
      {sel('work',  opt(QC.categories))}
      {(scope.block!=='All'||scope.floor!=='All'||scope.flat!=='All'||scope.work!=='All') &&
        <button className="qc-clear" onClick={() => setScope({block:'All',floor:'All',flat:'All',work:'All'})}>Reset</button>}
    </div>
  );
}

/* ---- main console ---- */
function ConsolePage(){
  const QC = window.QC;
  const [drill, setDrill] = React.useState(null);
  const [scope, setScope] = React.useState({ block:'All', floor:'All', flat:'All', work:'All' });

  const openDrill = (dim, key, col) => { setDrill({ dim, dkey:key, col }); window.scrollTo(0,0); };

  if(drill){
    return <DrillDetail {...drill} onBack={() => setDrill(null)} />;
  }

  const overall = qcStat(QC.log);
  const rectified = QC.log.filter(r => r.status === 'NOT OK' && String(r.rectified||'').toLowerCase() === 'yes').length;

  // scoped
  const scoped = QC.log.filter(r =>
    (scope.block==='All' || r.block===scope.block) &&
    (scope.floor==='All' || r.floor===scope.floor) &&
    (scope.flat==='All'  || r.flat===scope.flat) &&
    (scope.work==='All'  || r.cat===scope.work));
  const ss = qcStat(scoped);
  const scopeActive = scope.block!=='All'||scope.floor!=='All'||scope.flat!=='All'||scope.work!=='All';

  const byBlock = QC.blocks.map(b => ({ key:b, s: qcStat(QC.log.filter(r => r.block===b)) }));
  const byCat   = QC.categories.map(c => ({ key:c, s: qcStat(QC.log.filter(r => r.cat===c)) }));
  const openDefects = QC.log.filter(r => r.status === 'NOT OK' && String(r.rectified||'').toLowerCase() !== 'yes');

  return (
    <div className="qc-page">
      {/* KPI band */}
      <div className="qc-kpi-band">
        <Kpi label="Checks Logged"    value={overall.checks} accent="#1763A6" />
        <Kpi label="OK / Passed"      value={overall.ok}     accent="#16855A" />
        <Kpi label="Defects (NOT OK)" value={overall.notok}  accent="#C83232" />
        <Kpi label="Open Defects"     value={overall.open}   accent="#E08600" />
        <Kpi label="Rectified"        value={rectified}      accent="#1763A6" />
        <Kpi label="Pass Rate"        value={fmtPct(overall.pass)} accent="#F2A104" sub={`${overall.ok} of ${overall.ok+overall.notok} rated`} />
      </div>

      {/* Drill-down scope */}
      <Card className="qc-scope-card">
        <SectionTitle kicker="DRILL-DOWN" title="Filter by Block · Floor · Flat · Work Type"
          right={<span className="qc-scope-count">{scoped.length} of {QC.log.length} checks</span>} />
        <ScopePicker scope={scope} setScope={setScope} />
        <div className="qc-scope-kpis">
          <div className="qc-skpi"><span className="qc-skpi-n">{ss.checks}</span><span className="qc-skpi-l">Checks</span></div>
          <div className="qc-skpi"><span className="qc-skpi-n" style={{color:'#16855A'}}>{ss.ok}</span><span className="qc-skpi-l">OK</span></div>
          <div className="qc-skpi"><span className="qc-skpi-n" style={{color:'#C83232'}}>{ss.notok}</span><span className="qc-skpi-l">NOT OK</span></div>
          <div className="qc-skpi"><span className="qc-skpi-n" style={{color:'#E08600'}}>{ss.open}</span><span className="qc-skpi-l">Open</span></div>
          <div className="qc-skpi"><span className="qc-skpi-n" style={{color:'#1763A6'}}>{fmtPct(ss.pass)}</span><span className="qc-skpi-l">Pass Rate</span></div>
          <div className="qc-scope-bar"><PassBar s={ss} /></div>
        </div>
        {scopeActive && ss.checks===0 &&
          <div className="qc-scope-empty">No checks logged for this scope yet.</div>}
      </Card>

      {/* Two matrix tables */}
      <div className="qc-matrix-grid">
        <Card className="qc-table-card">
          <SectionTitle kicker="STATUS" title="By Block"
            right={<span className="qc-hint">Click any number to drill in</span>} />
          <MatrixTable rows={byBlock} dim="block" head="Block" onOpen={openDrill} />
        </Card>
        <Card className="qc-table-card">
          <SectionTitle kicker="STATUS" title="By Work Category"
            right={<span className="qc-hint">Click any number to drill in</span>} />
          <MatrixTable rows={byCat} dim="cat" head="Category" onOpen={openDrill} />
        </Card>
      </div>

      {/* Open defects */}
      <Card className="qc-table-card">
        <SectionTitle kicker="ACTION REQUIRED" title="Open Defects"
          right={<span className="qc-pill-count">{openDefects.length} open</span>} />
        {openDefects.length === 0 ? (
          <EmptyState icon="✓" title="No open defects" sub="Every logged defect has been rectified." />
        ) : (
          <div className="qc-table-scroll">
            <table className="qc-table">
              <thead><tr>
                <th>Block</th><th>Floor</th><th>Flat</th><th>Category</th><th>Item ID</th>
                <th className="qc-th-check">Inspection Check</th><th>Status</th><th>Inspector</th>
              </tr></thead>
              <tbody>
                {openDefects.map((r,i) => (
                  <tr key={i}>
                    <td className="qc-mono">{r.block}</td><td>{r.floor}</td><td>{r.flat}</td>
                    <td>{r.cat}</td><td className="qc-mono qc-id">{r.itemId}</td>
                    <td className="qc-th-check">{r.check}</td>
                    <td><StatusBadge status={r.status} /></td><td>{r.inspector}</td>
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

/* matrix table used for both Block & Category */
function MatrixTable({ rows, dim, head, onOpen }){
  return (
    <div className="qc-table-scroll">
      <table className="qc-table qc-matrix">
        <thead>
          <tr>
            <th className="qc-th-key">{head}</th>
            <th className="qc-th-num">Checks</th>
            <th className="qc-th-num">OK</th>
            <th className="qc-th-num">NOT OK</th>
            <th className="qc-th-num">Open</th>
            <th className="qc-th-pass">Pass %</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({key,s}) => (
            <tr key={key} className={s.checks===0 ? 'is-empty-row' : ''}>
              <td className="qc-td-key">{dim==='block' ? <span className="qc-blocktag">{key}</span> : key}</td>
              <CellNum n={s.checks} col="checks" dim={dim} dkey={key} onOpen={onOpen} />
              <CellNum n={s.ok}     col="ok"     dim={dim} dkey={key} onOpen={onOpen} />
              <CellNum n={s.notok}  col="notok"  dim={dim} dkey={key} onOpen={onOpen} />
              <CellNum n={s.open}   col="open"   dim={dim} dkey={key} onOpen={onOpen} />
              <td className="qc-td-pass">
                <div className="qc-pass-wrap">
                  <span className="qc-pass-val">{fmtPct(s.pass)}</span>
                  <PassBar s={s} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

Object.assign(window, { ConsolePage });
