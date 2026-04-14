// ════════════════════════════════════════════════════════════════
// Apps Script — Suivi Magasin (lecture + écriture)
//
// Déployé en Web App :
//   - doGet  → renvoie les stats d'une période
//   - doPost → ajoute une ligne dans l'onglet "Suivi"
//
// ARCHITECTURE
// ─────────────
// UN SEUL Apps Script partagé pour tous les magasins (tous clients).
// Chaque magasin a son PROPRE Google Sheet, ciblé via `sheetId`.
//
//   doGet  : ?sheetId=<ID>&start=YYYY-MM-DD&end=YYYY-MM-DD
//   doPost : body JSON contenant `sheetId` + les données de la ligne
//
// Le compte Google qui déploie ce script DOIT avoir accès à chaque
// sheet (partage Drive obligatoire), sinon openById échouera.
//
// Si aucun sheetId n'est fourni → fallback sur le sheet bound au
// projet (rétrocompatibilité avec l'ancienne architecture).
// ════════════════════════════════════════════════════════════════

function _openSheet(sheetId) {
  const ss = sheetId
    ? SpreadsheetApp.openById(sheetId)
    : SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName("Suivi") || ss.getActiveSheet();
}

function doGet(e) {
  const sheetId = e.parameter.sheetId;
  const start   = e.parameter.start;  // format YYYY-MM-DD
  const end     = e.parameter.end;

  const sheet   = _openSheet(sheetId);
  const data    = sheet.getDataRange().getValues();
  const headers = data[0].map(h => String(h).trim().toLowerCase());

  // Lookup des colonnes insensible à la casse / aux espaces
  const COL = {
    date:   headers.indexOf("date"),
    type:   headers.indexOf("type"),
    source: headers.indexOf("source"),
    axe:    headers.indexOf("axe"),
    ca:     headers.indexOf("ca"),
  };

  const rows = data.slice(1).filter(row => {
    const rawDate = row[COL.date];
    if (!rawDate) return false;

    let dateStr;
    if (typeof rawDate === "string" && rawDate.includes("T")) {
      // Format ISO : "2026-03-30T10:37:50.980+02:00"
      dateStr = rawDate.split("T")[0];
    } else if (typeof rawDate === "string" && rawDate.includes("/")) {
      // Format FR : "13/04/2026" ou "13/04/2026 15:03:34"
      // On retire l'éventuelle partie heure avant de splitter sur /
      const datePart = rawDate.split(" ")[0];
      const [d, m, y] = datePart.split("/");
      dateStr = `${y}-${m}-${d}`;
    } else if (rawDate instanceof Date) {
      dateStr = Utilities.formatDate(rawDate, Session.getScriptTimeZone(), "yyyy-MM-dd");
    } else {
      dateStr = String(rawDate).substring(0, 10);
    }

    return dateStr >= start && dateStr <= end;
  });

  const totals = {
    "Entrée Magasin": 0,
    "Vente Magasin":  0,
    "Call Magasin":   0,
  };

  const sources = {};
  const axes    = {};
  let totalCA   = 0;

  rows.forEach(row => {
    const type   = row[COL.type]   || "";
    const source = row[COL.source] || "";
    const axe    = row[COL.axe]    || "";
    const ca     = parseFloat(row[COL.ca]) || 0;

    if (totals.hasOwnProperty(type)) totals[type]++;
    if (source) sources[source] = (sources[source] || 0) + 1;
    if (axe)    axes[axe]       = (axes[axe]    || 0) + 1;
    if (ca > 0) totalCA += ca;
  });

  const result = {
    total:   rows.length,
    totalCA: totalCA,
    totals:  totals,
    sources: sources,
    axes:    axes,
  };

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const data  = JSON.parse(e.postData.contents);
    const sheet = _openSheet(data.sheetId);

    sheet.appendRow([
      new Date().toISOString(), // A — date ISO (parsée sans ambiguïté par doGet)
      data.heure   || "",       // B
      data.jour    || "",       // C
      data.type    || "",       // D
      data.source  || "",       // E
      data.axe     || "",       // F
      data.ca      || "",       // G
      data.magasin || ""        // H
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
