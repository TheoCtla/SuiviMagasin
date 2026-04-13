// ════════════════════════════════════════════════════════════════
//  config.js — Configuration multi-tenant
//
//  Ce fichier est chargé en <head> pour que les variables CSS et
//  le titre de l'onglet soient appliqués AVANT le premier rendu
//  du body (évite le flash de contenu non stylé).
//
//  Usage : ?client=<slug> dans l'URL (ex: ?client=france-literie-perpignan)
//
//  ► Voir la doc complète au-dessus de const CLIENTS.
// ════════════════════════════════════════════════════════════════

const THEMES = {
  "france-literie": {
    brandName: "France Literie",
    brandHtml: '<span>FRANCE </span><span class="highlight">LITERIE</span>',
    // logoUrl: laissé vide → on garde le logo inline du HTML par défaut
    logoUrl: null,
    vars: {
      "--bg":          "#1e1007",
      "--surface":     "#2d1a0e",
      "--surface2":    "#3a2212",
      "--surface3":    "#4a2d18",
      "--border":      "#5e3820",
      "--accent":      "#c3cc47",
      "--accent-glow": "rgba(195,204,71,0.15)",
      "--accent2":     "#e8734a",
      "--accent3":     "#7eb8c9",
      "--text":        "#f6f1e8",
      "--muted":       "#7a6050",
      "--success":     "#6dba8a",
      "--silver":      "#c5b8a5",
      "--font-display":"'Playfair Display', serif",
      "--font-mono":   "'DM Mono', monospace",
    }
  },
  // Pour ajouter une enseigne : dupliquer le bloc ci-dessus, changer
  // les couleurs / le logo / le brandHtml.
};

// ────────────────────────────────────────────────────────────────
//  CLIENTS = liste des magasins.
//  Un magasin = 1 entrée = 1 Google Sheet dédié + 1 thème d'enseigne.
//
//  Architecture :
//    - UN SEUL Apps Script partagé (même statsUrl partout)
//    - UN Google Sheet par magasin (isolation des données)
//    - UN thème par enseigne (couleurs, logo, nom)
//
//  ► AJOUTER UN MAGASIN
//    1. Créer un nouveau Google Sheet avec :
//         - un onglet nommé "Suivi"
//         - en ligne 1, les headers :
//           date | heure | jour | type | source | axe | ca | magasin
//    2. Partager ce sheet (droit Éditeur) avec le compte qui a déployé
//       l'Apps Script (sinon openById échouera côté script).
//    3. Copier l'ID du sheet depuis son URL :
//         https://docs.google.com/spreadsheets/d/<SHEET_ID>/edit
//    4. Dupliquer un bloc ci-dessous et renseigner :
//         - slug unique (ex: "france-literie-lyon")
//         - brand (doit exister dans THEMES)
//         - city
//         - sheetId (collé à l'étape 3)
//         - statsUrl (la même que les autres — ne pas changer)
//    5. Dans Webflow, créer une page CMS qui embed l'iframe avec
//       ?client=<slug>.
//
//  ► AJOUTER UNE NOUVELLE ENSEIGNE
//    1. Ajouter un bloc dans THEMES (couleurs, logoUrl, brandHtml, brandName)
//    2. Ajouter les magasins dans CLIENTS en pointant sur `brand: "<nouvel-id>"`
//    3. Pas besoin d'un nouveau Apps Script ni d'un nouveau déploiement.
// ────────────────────────────────────────────────────────────────
const STATS_URL = "https://script.google.com/macros/s/AKfycbz4mh3DJGl6rNLBdg25L7RQv6VXFOSQ0FfzZHp2ljgyJCXvdRFUWhNonoV6YMuDh3Kw/exec";

const CLIENTS = {
  "france-literie-perpignan": {
    brand:    "france-literie",
    city:     "Perpignan",
    sheetId:  "1CZ-X8cjXfp66dGMK8ub58cv-LoC8sraCsJdGCyhM1mc",
    statsUrl: STATS_URL,
  },
  "france-literie-antibes-vallauris": {
    brand:    "france-literie",
    city:     "Antibes Vallauris",
    sheetId:  "1BK8QX5Nh-SSWQcGK7QG_vgMDizq_r8KL21pWiEtmQKc",
    statsUrl: STATS_URL,
  },
};

const DEFAULT_CLIENT = "france-literie-perpignan";

// ── Résolution du client courant ──
(function resolveClient(){
  const params = new URLSearchParams(location.search);
  const clientId = params.get('client') || DEFAULT_CLIENT;
  const client = CLIENTS[clientId] || CLIENTS[DEFAULT_CLIENT];
  const theme = THEMES[client.brand];

  // Variables CSS de l'enseigne (override des défauts du <style>)
  if(theme && theme.vars){
    Object.entries(theme.vars).forEach(([k,v]) => {
      document.documentElement.style.setProperty(k, v);
    });
  }

  // Classe enseigne sur <html> pour CSS spécifique éventuel
  document.documentElement.classList.add('brand-' + client.brand);

  // Titre de l'onglet
  const cityLabel = client.city ? ' ' + client.city : '';
  document.title = (theme ? theme.brandName : 'Suivi Magasin') + cityLabel + ' — Suivi Magasin';

  // Exposition globale pour le script principal en bas de page
  window.CLIENT = client;
  window.THEME  = theme;
  window.CONFIG = {
    clientId:  clientId,
    storeName: (theme ? theme.brandName : '') + cityLabel,
    statsUrl:  client.statsUrl,
    sheetId:   client.sheetId || "",
  };
})();
