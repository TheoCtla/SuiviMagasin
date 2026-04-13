// ════════════════════════════════════════════════════════════════
//  branding.js — Applique le thème de l'enseigne au DOM
//
//  Charge après le DOM (en fin de <body>).
//  Déclare aussi la constante globale CONFIG utilisée par les
//  autres scripts (saisie, stats, app).
// ════════════════════════════════════════════════════════════════

const CONFIG = window.CONFIG;

// Application du branding de l'enseigne au DOM
(function applyBranding(){
  const theme = window.THEME;
  if(!theme) return;

  // Logo : si l'enseigne fournit une URL, on remplace l'image
  if(theme.logoUrl){
    const logoImg = document.querySelector('.logo-img');
    if(logoImg){
      logoImg.src = theme.logoUrl;
      logoImg.alt = theme.brandName;
    }
  }

  // Nom du magasin (texte affiché à droite du logo)
  if(theme.brandHtml){
    const storeName = document.querySelector('.store-name');
    if(storeName) storeName.innerHTML = theme.brandHtml;
  }

  // Texte de fallback du logo (initiales)
  const fb = document.getElementById('logo-fallback');
  if(fb && theme.brandName){
    fb.textContent = theme.brandName.split(' ').map(w=>w[0]).join('').slice(0,2);
  }
})();
