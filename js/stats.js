// ════════════════════════════════════════════════════════════════
//  stats.js — Datepicker + chargement et rendu des statistiques
//
//  Récupère les données via l\047Apps Script doGet et les affiche
//  sous forme de KPIs et barres (sources, axes produits).
// ════════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════
//  DATE PICKER (inline)
// ════════════════════════════════════════════════════════
const SHORTCUTS = [
  {label:"Aujourd'hui",       key:'today'},
  {label:"Hier",              key:'yesterday'},
  {label:"7 derniers jours",  key:'7d'},
  {label:"14 derniers jours", key:'14d'},
  {label:"28 derniers jours", key:'28d'},
  {label:"30 derniers jours", key:'30d'},
  {label:"Cette semaine",     key:'thisweek'},
  {label:"Semaine dernière",  key:'lastweek'},
  {label:"Ce mois-ci",        key:'thismonth'},
  {label:"Mois dernier",      key:'lastmonth'},
  {label:"Maximum",           key:'all'},
];

let dp = { sc:null, picking:'start', start:null, end:null, ly:0, lm:0 };
let applied = { start:null, end:null };

const today   = () => { const d=new Date(); d.setHours(0,0,0,0); return d; };
const addD    = (d,n) => { const r=new Date(d); r.setDate(r.getDate()+n); return r; };
const fmt     = d => d ? `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` : '';
const fmtFR   = d => d ? d.toLocaleDateString('fr-FR') : '—';
const MOIS    = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const JOURS   = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];

function scRange(key){
  const t=today();
  const dow=(t.getDay()+6)%7;
  switch(key){
    case 'today':     return [t,t];
    case 'yesterday': return [addD(t,-1),addD(t,-1)];
    case '7d':        return [addD(t,-6),t];
    case '14d':       return [addD(t,-13),t];
    case '28d':       return [addD(t,-27),t];
    case '30d':       return [addD(t,-29),t];
    case 'thisweek':  return [addD(t,-dow),t];
    case 'lastweek':  { const s=addD(t,-dow-7),e=addD(t,-dow-1); return [s,e]; }
    case 'thismonth': return [new Date(t.getFullYear(),t.getMonth(),1),t];
    case 'lastmonth': { const s=new Date(t.getFullYear(),t.getMonth()-1,1),e=new Date(t.getFullYear(),t.getMonth(),0); return [s,e]; }
    case 'all':       return [new Date(2024,0,1),t];
    default: return [null,null];
  }
}

function buildSC(){
  const el=document.getElementById('dp-sc-list');
  el.innerHTML=SHORTCUTS.map(s=>`
    <button class="dp-sc-btn${dp.sc===s.key?' active':''}" onclick="applyShortcut('${s.key}')">
      <span class="dp-sc-radio"></span>${s.label}
    </button>`).join('');
}

function applyShortcut(key){
  const [s,e]=scRange(key);
  dp.start=s; dp.end=e; dp.sc=key; dp.picking='start';
  syncInp(); buildSC(); renderCals();
}

function toggleInlineDp(){
  const inline=document.getElementById('dp-inline');
  const pill=document.getElementById('dp-pill');
  const isOpen=inline.classList.contains('open');
  if(!isOpen){
    const t=today();
    dp.ly=t.getFullYear(); dp.lm=t.getMonth()-1;
    if(dp.lm<0){dp.lm=11;dp.ly--;}
    dp.start=applied.start; dp.end=applied.end; dp.sc=null; dp.picking='start';
    buildSC(); renderCals(); syncInp();
  }
  inline.classList.toggle('open',!isOpen);
  pill.classList.toggle('open',!isOpen);
}

function closeInlineDp(){
  document.getElementById('dp-inline').classList.remove('open');
  document.getElementById('dp-pill').classList.remove('open');
}

function applyAndLoad(){
  if(!dp.start||!dp.end) return;
  applied.start=dp.start; applied.end=dp.end;
  document.getElementById('dp-pill-range').textContent = fmtFR(applied.start)+' – '+fmtFR(applied.end);
  closeInlineDp();
  loadStats();
}

function syncInp(){
  document.getElementById('dp-in-s').value=fmt(dp.start)||'';
  document.getElementById('dp-in-e').value=fmt(dp.end)||'';
}

function onManualInput(){
  const s=document.getElementById('dp-in-s').value;
  const e=document.getElementById('dp-in-e').value;
  if(s) dp.start=new Date(s+'T00:00:00');
  if(e) dp.end=new Date(e+'T00:00:00');
  dp.sc=null; buildSC(); renderCals();
}

function renderCals(){
  const ry=dp.lm===11?dp.ly+1:dp.ly;
  const rm=dp.lm===11?0:dp.lm+1;
  renderOneCal('dp-cal-L',dp.ly,dp.lm,true);
  renderOneCal('dp-cal-R',ry,rm,false);
}

function renderOneCal(id,y,m,isLeft){
  const t=today();
  const last=new Date(y,m+1,0);
  let dow=new Date(y,m,1).getDay()-1; if(dow<0)dow=6;

  let h=`<div class="dp-cal-head">
    ${isLeft?`<button class="dp-nav" onclick="navCal(-1)">‹</button>`:`<div></div>`}
    <div class="dp-cal-title">${MOIS[m]} ${y}</div>
    ${!isLeft?`<button class="dp-nav" onclick="navCal(1)">›</button>`:`<div></div>`}
  </div><div class="dp-grid">`;

  JOURS.forEach(j=>{h+=`<div class="dp-dow">${j}</div>`;});
  for(let i=0;i<dow;i++) h+=`<button class="dp-day dp-empty"></button>`;

  for(let d=1;d<=last.getDate();d++){
    const date=new Date(y,m,d);
    const iT=date.getTime()===t.getTime();
    const iS=dp.start&&date.getTime()===dp.start.getTime();
    const iE=dp.end&&date.getTime()===dp.end.getTime();
    const iR=dp.start&&dp.end&&date>dp.start&&date<dp.end;
    let c='dp-day';
    if(iT)c+=' dp-today'; if(iS)c+=' dp-start'; if(iE)c+=' dp-end'; if(iR)c+=' dp-in-range';
    h+=`<button class="${c}" onclick="pickDay(${y},${m},${d})">${d}</button>`;
  }
  h+='</div>';
  document.getElementById(id).innerHTML=h;
}

function navCal(dir){
  dp.lm+=dir;
  if(dp.lm>11){dp.lm=0;dp.ly++;}
  if(dp.lm<0) {dp.lm=11;dp.ly--;}
  renderCals();
}

function pickDay(y,m,d){
  const picked=new Date(y,m,d);
  if(dp.picking==='start'||(dp.start&&dp.end)){
    dp.start=picked; dp.end=null; dp.picking='end';
  } else {
    if(picked<dp.start){dp.end=dp.start;dp.start=picked;}
    else dp.end=picked;
    dp.picking='start';
  }
  dp.sc=null; syncInp(); buildSC(); renderCals();
}

// ════════════════════════════════════════════════════════
//  STATS
// ════════════════════════════════════════════════════════
function setState(id){
  ['stats-empty','stats-loading','stats-error','stats-data'].forEach(s=>{
    document.getElementById(s).style.display = s===id ? '' : 'none';
  });
}

async function loadStats(){
  if(!applied.start||!applied.end) return;
  const start=fmt(applied.start);
  const end = applied.start.getTime()===applied.end.getTime()
    ? fmt(addD(applied.end,1))
    : fmt(applied.end);
  setState('stats-loading');

  try {
    let data;
    if(CONFIG.statsUrl==="COLLER_ICI_URL_APPS_SCRIPT"){
      // Mode démo
      await new Promise(r=>setTimeout(r,700));
      data={
        total:38,
        totalCA: 24850,
        totals:{"Entrée Magasin":18,"Vente Magasin":12,"Call Magasin":8},
        sources:{"Internet (Google)":14,"Facebook / Instagram":10,"Recommandation":8,"Emplacement":4,"Autre":2},
        axes:{"Matelas":5,"Lit Coffre":3,"Lit Motorisé":2,"Linge de Maison":1,"Oreillers":1}
      };
    } else {
      // Un sheet par magasin → on cible via sheetId, pas besoin de filtrer
      const url = `${CONFIG.statsUrl}?sheetId=${encodeURIComponent(CONFIG.sheetId)}&start=${start}&end=${end}`;
      const resp = await fetch(url);
      if(!resp.ok) throw new Error('HTTP '+resp.status);
      data = await resp.json();
    }
    renderStats(data, fmt(applied.start), fmt(applied.end));
  } catch(e){
    console.error(e); setState('stats-error');
  }
}

function renderStats(data, start, end){
  const fr=s=>s.split('-').reverse().join('/');
  document.getElementById('stats-period-val').textContent =
    `${fr(start)} → ${fr(end)}  ·  ${data.total} enregistrement${data.total>1?'s':''}`;

  document.getElementById('s-entree').textContent = data.totals["Entrée Magasin"]||0;
  document.getElementById('s-vente').textContent  = data.totals["Vente Magasin"] ||0;
  document.getElementById('s-call').textContent   = data.totals["Call Magasin"]  ||0;

  // CA total
  const caEl = document.getElementById('s-ca');
  if(data.totalCA !== undefined && data.totalCA !== null){
    caEl.textContent = Number(data.totalCA).toLocaleString('fr-FR') + ' €';
  } else {
    caEl.textContent = '—';
  }

  const ent=data.totals["Entrée Magasin"]||0, ven=data.totals["Vente Magasin"]||0;
  document.getElementById('s-conv').textContent = ent>0 ? Math.round((ven/ent)*100)+'%' : '—';

  renderBars('s-sources', data.sources, 'fill-src');

  const axSec=document.getElementById('s-axes-section');
  if(data.axes&&Object.keys(data.axes).length){
    axSec.style.display=''; renderBars('s-axes', data.axes, 'fill-axe');
  } else {
    axSec.style.display='none';
  }

  setState('stats-data');
}

function renderBars(id, obj, cls){
  const c=document.getElementById(id); c.innerHTML='';
  if(!obj||!Object.keys(obj).length) return;
  const max=Math.max(...Object.values(obj));
  Object.entries(obj).sort((a,b)=>b[1]-a[1]).forEach(([n,v])=>{
    const pct=max>0?Math.round((v/max)*100):0;
    const row=document.createElement('div'); row.className='bar-row';
    row.innerHTML=`<div class="bar-name" title="${n}">${n}</div>
      <div class="bar-track"><div class="bar-fill ${cls}" style="width:0%" data-pct="${pct}%"></div></div>
      <div class="bar-count">${v}</div>`;
    c.appendChild(row);
  });
  requestAnimationFrame(()=>
    c.querySelectorAll('.bar-fill').forEach(el=>el.style.width=el.dataset.pct)
  );
}
