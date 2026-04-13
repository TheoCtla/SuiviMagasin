// ════════════════════════════════════════════════════════════════
//  app.js — Point d'entrée
//
//  Initialisations globales (horloge, onglets) et synchronisation
//  de la hauteur quand la page est embarquée dans un iframe.
// ════════════════════════════════════════════════════════════════

// ── Clock ─────────────────────────────────────────────
function updateClock(){
  const now = new Date();
  document.getElementById('live-time').textContent =
    now.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
  document.getElementById('live-date').textContent =
    now.toLocaleDateString('fr-FR',{day:'2-digit',month:'short'});
}
updateClock(); setInterval(updateClock, 30000);

// ── Tab navigation ────────────────────────────────────
function switchTab(tab) {
  document.getElementById('page-saisie').style.display = tab === 'saisie' ? '' : 'none';
  document.getElementById('page-stats').classList.toggle('active', tab === 'stats');
  document.getElementById('tab-saisie').classList.toggle('active', tab === 'saisie');
  document.getElementById('tab-stats').classList.toggle('active', tab === 'stats');
}

// ── Sync hauteur si embarquée en iframe ────────────────
(function() {
  function sendHeight() {
    var h = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    window.parent.postMessage({ type: 'resize', height: h }, '*');
  }
  sendHeight();
  window.addEventListener('resize', sendHeight);
  new MutationObserver(sendHeight).observe(document.body, { childList: true, subtree: true, attributes: true });
})();
