// ════════════════════════════════════════════════════════════════
//  dupplicationSheet.js — Duplication en masse de Google Sheets
//
//  Pour chaque magasin de la liste MAGASINS, ce script :
//    1. Duplique le sheet TEMPLATE_ID dans le dossier FOLDER_ID
//    2. Le renomme selon la convention par enseigne
//       (FL <ville> | Emma <ville> | SudC <ville>)
//    3. Logue l'ID du nouveau sheet, prêt à coller dans js/config.js
//
//  ⚠️  CE SCRIPT EST DESTINÉ À TOURNER DANS GOOGLE APPS SCRIPT,
//      PAS EN LOCAL AVEC NODE.
//
//  USAGE :
//    1. Aller sur https://script.google.com → Nouveau projet
//       (un projet dédié, séparé du web app FL Perpi qui sert de doGet/doPost)
//    2. Coller tout ce fichier dans Code.gs → ⌘+S
//    3. Lancer la fonction `main` (menu déroulant à côté du ▶ Exécuter)
//    4. Première exécution : autoriser l'accès à Google Drive
//    5. Récupérer les IDs dans le journal d'exécution (Affichage → Logs)
//    6. Coller chaque ID dans la bonne entrée de js/config.js
//
//  Le script est IDEMPOTENT : si un fichier porte déjà le nom cible
//  dans le dossier de destination, il est ignoré (pas de doublons).
// ════════════════════════════════════════════════════════════════

const TEMPLATE_ID = "1nDF0toMR2tnN5xvod1AdkZjg_aXWlodLojrHfEA7Dsc";  // FL Aix-en-Provence
const FOLDER_ID   = "1iE6cGZ6JEIhwijn2jEVKOnKrpmiLjFx-";              // Dossier Drive de destination

// Magasins à créer (slug = clé dans CLIENTS, name = nom du fichier Google Sheet)
const MAGASINS = [
  // ── France Literie ──
  { slug: "france-literie-annemasse",              name: "FL Annemasse" },
  { slug: "france-literie-champagne",              name: "FL Champagne" },
  { slug: "france-literie-dijon",                  name: "FL Dijon" },
  { slug: "france-literie-saint-priest-et-givors", name: "FL Saint-Priest-et-Givors" },

  // ── Emma ──
  { slug: "emma-merignac",   name: "Emma Merignac" },
  { slug: "emma-nantes",     name: "Emma Nantes" },
  { slug: "emma-perpignan",  name: "Emma Perpignan" },
  { slug: "emma-vendenheim", name: "Emma Vendenheim" },

  // ── Sud Cuisine ──
  { slug: "sud-cuisine-tarbes",   name: "SudC Tarbes" },
  { slug: "sud-cuisine-bayonne",  name: "SudC Bayonne" },
  { slug: "sud-cuisine-merignac", name: "SudC Merignac" },
  { slug: "sud-cuisine-rodez",    name: "SudC Rodez" },
  { slug: "sud-cuisine-condom",   name: "SudC Condom" },
  { slug: "sud-cuisine-yzosse",   name: "SudC Yzosse" },
  { slug: "sud-cuisine-langon",   name: "SudC Langon" },
];

function main() {
  const template = DriveApp.getFileById(TEMPLATE_ID);
  const folder   = DriveApp.getFolderById(FOLDER_ID);

  // Pré-charge les fichiers déjà présents dans le dossier (pour idempotence)
  const existing = {};
  const it = folder.getFiles();
  while (it.hasNext()) {
    const f = it.next();
    existing[f.getName()] = f.getId();
  }

  const results = [];
  MAGASINS.forEach(({ slug, name }) => {
    if (existing[name]) {
      results.push({ slug, name, id: existing[name], status: "skipped" });
      Logger.log("⏭  " + name.padEnd(35) + " déjà existant → " + existing[name]);
      return;
    }
    try {
      const copy = template.makeCopy(name, folder);
      const id = copy.getId();
      results.push({ slug, name, id, status: "created" });
      Logger.log("✅ " + name.padEnd(35) + " → " + id);
    } catch (err) {
      results.push({ slug, name, status: "error", error: String(err) });
      Logger.log("❌ " + name.padEnd(35) + " : " + err);
    }
  });

  // Récap final prêt à coller dans config.js
  Logger.log("");
  Logger.log("═══════════════════════════════════════════════════════════");
  Logger.log("Récap (slug → sheetId) :");
  Logger.log("═══════════════════════════════════════════════════════════");
  results
    .filter(r => r.id)
    .forEach(r => Logger.log('"' + r.slug + '": "' + r.id + '",'));

  const errors = results.filter(r => r.status === "error");
  if (errors.length) {
    Logger.log("");
    Logger.log("⚠️  Erreurs :");
    errors.forEach(r => Logger.log("  - " + r.name + " : " + r.error));
  }

  Logger.log("");
  Logger.log("Total : " + results.filter(r => r.status === "created").length + " créés, "
    + results.filter(r => r.status === "skipped").length + " ignorés, "
    + errors.length + " erreurs");
}
