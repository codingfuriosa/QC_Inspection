/* Shared design tokens, helpers and primitives for the QC Inspection app */

/* ---------- data helpers ---------- */
function qcStat(rows){
  const checks = rows.length;
  const ok = rows.filter(r => r.status === 'OK').length;
  const notok = rows.filter(r => r.status === 'NOT OK').length;
  const na = rows.filter(r => r.status === 'N/A').length;
  const pending = rows.filter(r => r.status === 'Pending').length;
  const open = rows.filter(r => r.status === 'NOT OK' && String(r.rectified||'').toLowerCase() !== 'yes').length;
  const denom = ok + notok;
  return { checks, ok, notok, na, pending, open, pass: denom ? ok/denom : null };
}

function fmtPct(p){ return p == null ? '—' : Math.round(p*100) + '%'; }

function fmtDate(iso){
  if(!iso) return '';
  const d = new Date(iso);
  if(isNaN(d)) return iso;
  return d.toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
}
function fmtDateShort(iso){
  if(!iso) return '';
  const d = new Date(iso);
  if(isNaN(d)) return iso;
  return d.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
}

const STATUS_META = {
  'OK':      { label:'OK',      color:'#16855A', bg:'#E4F4EC', dot:'#16855A' },
  'NOT OK':  { label:'NOT OK',  color:'#C83232', bg:'#FBE7E7', dot:'#C83232' },
  'Pending': { label:'Pending', color:'#8A6D00', bg:'#FBF1D6', dot:'#C99700' },
  'N/A':     { label:'N/A',     color:'#5C6B79', bg:'#EDF1F5', dot:'#9AA8B4' },
};
function statusMeta(s){ return STATUS_META[s] || STATUS_META['N/A']; }

/* ---------- primitives ---------- */
function StatusBadge({ status }){
  const m = statusMeta(status);
  return (
    <span className="qc-badge" style={{ color:m.color, background:m.bg }}>
      <span className="qc-badge-dot" style={{ background:m.dot }}></span>
      {m.label}
    </span>
  );
}

function Card({ children, className, style }){
  return <div className={"qc-card " + (className||'')} style={style}>{children}</div>;
}

function SectionTitle({ kicker, title, right }){
  return (
    <div className="qc-section-head">
      <div>
        {kicker && <div className="qc-kicker">{kicker}</div>}
        <h2 className="qc-section-title">{title}</h2>
      </div>
      {right && <div className="qc-section-right">{right}</div>}
    </div>
  );
}

function EmptyState({ icon, title, sub }){
  return (
    <div className="qc-empty">
      <div className="qc-empty-icon">{icon || '∅'}</div>
      <div className="qc-empty-title">{title}</div>
      {sub && <div className="qc-empty-sub">{sub}</div>}
    </div>
  );
}

/* tiny horizontal proportion bar: ok / notok / other */
function PassBar({ s }){
  const total = s.checks || 1;
  const okw = (s.ok/total)*100;
  const now = (s.notok/total)*100;
  const otw = 100 - okw - now;
  return (
    <div className="qc-passbar" title={`${s.ok} OK · ${s.notok} NOT OK · ${s.na+s.pending} other`}>
      <span style={{ width: okw+'%', background:'#16855A' }}></span>
      <span style={{ width: now+'%', background:'#C83232' }}></span>
      <span style={{ width: otw+'%', background:'#D7DEE6' }}></span>
    </div>
  );
}

/* KPI card for the console band */
function Kpi({ label, value, sub, tone, accent }){
  return (
    <div className={"qc-kpi " + (tone||'')}>
      {accent && <span className="qc-kpi-accent" style={{ background: accent }}></span>}
      <div className="qc-kpi-label">{label}</div>
      <div className="qc-kpi-value">{value}</div>
      {sub && <div className="qc-kpi-sub">{sub}</div>}
    </div>
  );
}

Object.assign(window, {
  qcStat, fmtPct, fmtDate, fmtDateShort, statusMeta, STATUS_META,
  StatusBadge, Card, SectionTitle, EmptyState, PassBar, Kpi
});
