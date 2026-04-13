// ════════════════════════════════════════════════════════════════
//  saisie.js — Formulaire de saisie + envoi des données
//
//  État, compteurs (localStorage par client), navigation entre
//  étapes et POST vers l\047Apps Script doPost.
// ════════════════════════════════════════════════════════════════

// ── Saisie state ──────────────────────────────────────
let selType=null, selSource=null, selAxe=null, selCA=null;
const typeLabels = { entree:"Entrée Magasin", vente:"Vente Magasin", call:"Call Magasin" };

// Compteurs persistés par jour dans localStorage
const COUNTER_KEY = 'flux_counters_' + (CONFIG.clientId || 'default');
function loadCounters(){
  try {
    const raw = localStorage.getItem(COUNTER_KEY);
    if(raw){
      const saved = JSON.parse(raw);
      const todayStr = new Date().toLocaleDateString('fr-FR');
      if(saved.date === todayStr) return saved.values;
    }
  } catch(e){}
  return { entree:0, vente:0, call:0 };
}
function saveCounters(){
  localStorage.setItem(COUNTER_KEY, JSON.stringify({
    date: new Date().toLocaleDateString('fr-FR'),
    values: counters
  }));
}
const counters = loadCounters();
document.getElementById('count-entree').textContent = counters.entree;
document.getElementById('count-vente').textContent = counters.vente;
document.getElementById('count-call').textContent = counters.call;

function showStep(id){
  document.querySelectorAll('.step').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function selectType(type, btn){
  selType=type; selAxe=null; selCA=null;
  document.querySelectorAll('#step-type .card-btn').forEach(b=>b.classList.remove('selected'));
  btn.classList.add('selected');
  setTimeout(()=>{
    const b=document.getElementById('recap-type-badge');
    b.textContent=typeLabels[type]; b.className='recap-badge badge-'+type;
    showStep('step-source');
  },180);
}

function selectSource(src, btn){
  selSource=src;
  document.querySelectorAll('#step-source .card-btn').forEach(b=>b.classList.remove('selected'));
  btn.classList.add('selected');
  if(selType==='vente') setTimeout(()=>{
    // Reset axe/CA à chaque retour sur cette étape
    selAxe=null; selCA=null;
    document.querySelectorAll('#step-axe .card-btn').forEach(b=>b.classList.remove('selected'));
    document.getElementById('ca-input').value='';
    document.getElementById('btn-send-axe').disabled=true;
    showStep('step-axe');
  },180);
  else document.getElementById('btn-send').disabled=false;
}

function selectAxe(axe, btn){
  selAxe=axe;
  document.querySelectorAll('#step-axe .card-btn').forEach(b=>b.classList.remove('selected'));
  btn.classList.add('selected');
  checkAxeReady();
}

function onCAInput(){
  // CA optionnel — on valide si un axe est sélectionné, CA peut être vide
  const v = document.getElementById('ca-input').value;
  selCA = v !== '' ? parseFloat(v) : null;
  checkAxeReady();
}

function checkAxeReady(){
  // Bouton actif dès qu'un produit est sélectionné (CA optionnel)
  document.getElementById('btn-send-axe').disabled = !selAxe;
}

function goBack(){
  selSource=null;
  document.querySelectorAll('#step-source .card-btn').forEach(b=>b.classList.remove('selected'));
  document.getElementById('btn-send').disabled=true;
  document.getElementById('error-msg').style.display='none';
  showStep('step-type');
}

function goBackFromAxe(){
  selAxe=null; selCA=null;
  document.querySelectorAll('#step-axe .card-btn').forEach(b=>b.classList.remove('selected'));
  document.getElementById('ca-input').value='';
  document.getElementById('btn-send-axe').disabled=true;
  showStep('step-source');
}

function resetSaisie(){
  selType=selSource=selAxe=selCA=null;
  document.querySelectorAll('.card-btn').forEach(b=>b.classList.remove('selected'));
  document.getElementById('btn-send').disabled=true;
  document.getElementById('btn-send-axe').disabled=true;
  document.getElementById('ca-input').value='';
  document.getElementById('error-msg').style.display='none';
  document.getElementById('error-msg-axe').style.display='none';
  document.getElementById('r-axe-row').style.display='none';
  document.getElementById('r-ca-row').style.display='none';
  showStep('step-type');
}

async function sendData(){
  if(!selType||!selSource) return;
  const now=new Date();
  const date=now.toLocaleDateString('fr-FR');
  const time=now.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
  const jour=now.toLocaleDateString('fr-FR',{weekday:'long'});

  const payload={
    sheetId: CONFIG.sheetId,              // sheet à écrire (un par magasin)
    magasin: CONFIG.storeName,
    type:    typeLabels[selType],
    axe:     selAxe||'',
    ca:      selCA!==null ? selCA : '',   // chiffre d'affaires (vide si non renseigné)
    source:  selSource,
    date,
    heure:   time,
    jour,
    timestamp: now.toISOString()
  };

  const isV=selType==='vente';
  const btn=document.getElementById(isV?'btn-send-axe':'btn-send');
  const err=document.getElementById(isV?'error-msg-axe':'error-msg');
  btn.classList.add('loading'); btn.innerHTML='<span class="spinner"></span>Envoi...'; err.style.display='none';

  try {
    if(!CONFIG.statsUrl || CONFIG.statsUrl==="COLLER_ICI_URL_APPS_SCRIPT"){
      await new Promise(r=>setTimeout(r,800));
      console.log('📊 [DÉMO]', payload);
    } else {
      // Apps Script : Content-Type text/plain pour éviter le preflight CORS
      const resp = await fetch(CONFIG.statsUrl,{
        method: 'POST',
        headers: {'Content-Type':'text/plain;charset=utf-8'},
        body: JSON.stringify(payload),
      });
      if(!resp.ok) throw new Error('HTTP '+resp.status);
    }
    counters[selType]++;
    saveCounters();
    document.getElementById('count-'+selType).textContent=counters[selType];
    document.getElementById('r-type').textContent=typeLabels[selType];
    document.getElementById('r-source').textContent=selSource;
    document.getElementById('r-time').textContent=time;
    document.getElementById('r-date').textContent=date+' ('+jour+')';

    const ar=document.getElementById('r-axe-row');
    const cr=document.getElementById('r-ca-row');
    if(selAxe){ document.getElementById('r-axe').textContent=selAxe; ar.style.display='flex'; }
    else ar.style.display='none';
    if(selCA!==null){ document.getElementById('r-ca').textContent=selCA.toLocaleString('fr-FR')+'€'; cr.style.display='flex'; }
    else cr.style.display='none';

    showStep('step-success');
  } catch(e){
    console.error(e); err.style.display='block';
  } finally {
    btn.classList.remove('loading'); btn.innerHTML='Enregistrer';
  }
}
