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
    logoUrl:   "img/imgFL.jpeg",
    vars: {
      // Background (dark mode bordeaux)
      "--bg":           "#1e1007",
      "--surface":      "#2d1a0e",
      "--surface2":     "#3a2212",
      "--surface3":     "#4a2d18",
      "--border":       "#5e3820",
      // Texte
      "--text":         "#f6f1e8",
      "--silver":       "#c5b8a5",
      "--muted":        "#7a6050",
      // Accent (or chaud)
      "--accent-rgb":   "195 204 71",
      "--accent-hover": "#d4dc52",
      "--btn-text":     "#2a1c10",
      // Sémantiques (mêmes pour toutes les enseignes)
      "--accent2":      "#e8734a",
      "--accent3":      "#7eb8c9",
      "--success":      "#6dba8a",
    }
  },

  "emma": {
    brandName: "Emma",
    brandHtml: '<span class="highlight">EMMA</span>',
    logoUrl:   "img/imgEmma.png",
    vars: {
      // Background — noir neutre (match le footer du site emma-matelas.fr)
      "--bg":           "#121212",
      "--surface":      "#1c1c1c",
      "--surface2":     "#262626",
      "--surface3":     "#303030",
      "--border":       "#3a3a3a",
      // Texte (blanc cassé neutre, pas de teinte chaude)
      "--text":         "#f5f5f5",
      "--silver":       "#b8b8b8",
      "--muted":        "#777777",
      // Accent (orange Emma officiel #FF6B35 = 255 107 53)
      "--accent-rgb":   "255 107 53",
      "--accent-hover": "#ff8555",
      "--btn-text":     "#ffffff",
      // Sémantiques (mêmes pour toutes les enseignes)
      "--accent2":      "#e8734a",
      "--accent3":      "#5fa8d3",
      "--success":      "#6dba8a",
    }
  },

  "sud-cuisine": {
    brandName: "Sud Cuisine",
    brandHtml: '<span>SUD </span><span class="highlight">CUISINE</span>',
    logoUrl:   "img/imgSudCuisine.png",
    vars: {
      // Background — warm charcoal (olive/kaki foncé)
      "--bg":           "#2f2e26",
      "--surface":      "#3a3931",
      "--surface2":     "#46443a",
      "--surface3":     "#524f44",
      "--border":       "#605d51",
      // Texte (clair chaud, cohérent avec le fond warm)
      "--text":         "#f2efe6",
      "--silver":       "#b8b3a6",
      "--muted":        "#787567",
      // Accent (rouge Sud Cuisine #c31b21 = 195 27 33)
      "--accent-rgb":   "195 27 33",
      "--accent-hover": "#e02a31",
      "--btn-text":     "#ffffff",
      // Quadrillage gris clair (blanc translucide sur fond sombre)
      "--grid-line":    "rgb(255 255 255 / 0.035)",
      // Sémantiques (mêmes pour toutes les enseignes)
      "--accent2":      "#e8734a",
      "--accent3":      "#5fa8d3",
      "--success":      "#6dba8a",
    }
  },
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

  // ── FRANCE LITERIE ──────────────────────────────────────────────────────
  "france-literie-aix-en-provence": {
    brand:    "france-literie",
    city:     "Aix-en-Provence",
    sheetId:  "1nDF0toMR2tnN5xvod1AdkZjg_aXWlodLojrHfEA7Dsc",
    statsUrl: STATS_URL,
  },
  "france-literie-annemasse": {
    brand:    "france-literie",
    city:     "Annemasse",
    sheetId:  "",
    statsUrl: STATS_URL,
  },
  "france-literie-antibes-vallauris": {
    brand:    "france-literie",
    city:     "Antibes Vallauris",
    sheetId:  "1BK8QX5Nh-SSWQcGK7QG_vgMDizq_r8KL21pWiEtmQKc",
    statsUrl: STATS_URL,
  },
  "france-literie-champagne": {
    brand:    "france-literie",
    city:     "Champagne",
    sheetId:  "",
    statsUrl: STATS_URL,
  },
  "france-literie-dijon": {
    brand:    "france-literie",
    city:     "Dijon",
    sheetId:  "",
    statsUrl: STATS_URL,
  },
  "france-literie-perpignan": {
    brand:    "france-literie",
    city:     "Perpignan",
    sheetId:  "1CZ-X8cjXfp66dGMK8ub58cv-LoC8sraCsJdGCyhM1mc",
    statsUrl: STATS_URL,
  },
  "france-literie-saint-priest-et-givors": {
    brand:    "france-literie",
    city:     "Saint-Priest-et-Givors",
    sheetId:  "",
    statsUrl: STATS_URL,
  },

  // ── EMMA ──────────────────────────────────────────────────────────────
  "emma-merignac": {
    brand:    "emma",
    city:     "Merignac",
    sheetId:  "",            // vide → la saisie échouera mais l'aperçu visuel marche
    statsUrl: STATS_URL,
  },
  "emma-nantes": {
    brand:    "emma",
    city:     "Nantes",
    sheetId:  "",
    statsUrl: STATS_URL,
  },
  "emma-perpignan": {
    brand:    "emma",
    city:     "Perpignan",
    sheetId:  "",
    statsUrl: STATS_URL,
  },
  "emma-vendenheim": {
    brand:    "emma",
    city:     "Vendenheim",
    sheetId:  "",
    statsUrl: STATS_URL,
  },

  // ── SUD CUISINE ──────────────────────────────────────────────────────────────
  "sud-cuisine-tarbes": {
    brand:    "sud-cuisine",
    city:     "Tarbes",
    sheetId:  "",
    statsUrl: STATS_URL,
  },
  "sud-cuisine-bayonne": {
    brand:    "sud-cuisine",
    city:     "Bayonne",
    sheetId:  "",
    statsUrl: STATS_URL,
  },
  "sud-cuisine-merignac": {
    brand:    "sud-cuisine",
    city:     "Merignac",
    sheetId:  "",
    statsUrl: STATS_URL,
  },
  "sud-cuisine-rodez": {
    brand:    "sud-cuisine",
    city:     "Rodez",
    sheetId:  "",
    statsUrl: STATS_URL,
  },
  "sud-cuisine-condom": {
    brand:    "sud-cuisine",
    city:     "Condom",
    sheetId:  "",
    statsUrl: STATS_URL,
  },
  "sud-cuisine-yzosse": {
    brand:    "sud-cuisine",
    city:     "Yzosse",
    sheetId:  "",
    statsUrl: STATS_URL,
  },
  "sud-cuisine-langon": {
    brand:    "sud-cuisine",
    city:     "Langon",
    sheetId:  "",
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
