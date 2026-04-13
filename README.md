# FluxClientFL — Suivi Magasin

Dashboard web embarqué dans [tarmaac.io](https://www.tarmaac.io) pour le suivi en temps
réel des flux clients en point de vente (entrées, ventes, appels).

## Architecture

```
FluxClientFL/
├── index.html           # Structure HTML (shell)
├── css/
│   └── main.css         # Tous les styles
├── js/
│   ├── config.js        # THEMES + CLIENTS + résolution du client (charge en <head>)
│   ├── branding.js      # Applique thème/logo/nom au DOM (charge en fin de body)
│   ├── saisie.js        # Formulaire + POST vers Apps Script
│   ├── stats.js         # Datepicker + GET stats + rendu
│   └── app.js           # Horloge, onglets, sync iframe
├── appscript.js         # Google Apps Script (doGet + doPost)
└── README.md
```

**Pas de build step.** Ouvrir `index.html` dans un navigateur suffit.
Déploiement = push sur Vercel / Netlify qui sert les fichiers tels quels.

### Flux de données
```
┌───────────────┐    POST /exec    ┌──────────────────┐
│  index.html   │ ───────────────► │  Apps Script     │
│  (saisie)     │    GET  /exec    │  (doGet/doPost)  │
│  (stats)      │ ◄─────────────── │                  │
└───────────────┘                  └────────┬─────────┘
                                            │ openById
                                            ▼
                                   ┌──────────────────┐
                                   │  Google Sheet    │
                                   │  (1 par magasin) │
                                   └──────────────────┘
```

Un seul Apps Script partagé, un Google Sheet dédié par magasin (isolé via `sheetId`).

## Ajouter un magasin

1. **Créer un Google Sheet** avec un onglet nommé `Suivi` et les headers en ligne 1 :
   ```
   date | heure | jour | type | source | axe | ca | magasin
   ```

2. **Partager le sheet** (droit Éditeur) avec le compte Google qui a déployé
   l'Apps Script (sinon `openById` échouera côté script).

3. **Copier l'ID du sheet** depuis l'URL :
   ```
   https://docs.google.com/spreadsheets/d/<SHEET_ID>/edit
                                          ─────────
   ```

4. **Ajouter une entrée dans `js/config.js`** → `const CLIENTS` :
   ```js
   "france-literie-lyon": {
     brand:    "france-literie",   // doit exister dans THEMES
     city:     "Lyon",
     sheetId:  "<SHEET_ID>",
     statsUrl: STATS_URL,
   },
   ```

5. **Push** sur la branche principale → Vercel / Netlify redéploie automatiquement.

6. **Dans Webflow**, créer une page CMS avec slug `france-literie-lyon` et embed
   l'iframe pointant vers `/?client=france-literie-lyon`.

## Ajouter une nouvelle enseigne

1. Ajouter un bloc dans `const THEMES` (`js/config.js`) avec `brandName`,
   `brandHtml`, `logoUrl`, et les `vars` CSS (couleurs).
2. Créer les magasins dans `CLIENTS` en pointant sur `brand: "<nouvel-id>"`.
3. Pas besoin de nouveau Apps Script ni de nouveau déploiement — le même
   endpoint gère toutes les enseignes tant que les sheets sont partagés avec
   le compte du script.

## Apps Script : déploiement / mise à jour

Le fichier `appscript.js` est la source de vérité. Pour le mettre à jour :

1. Ouvrir [script.google.com](https://script.google.com) → projet `webapp FL Perpi`
2. Copier le contenu de `appscript.js` → coller dans `Code.gs` → ⌘+S
3. **Déployer → Gérer les déploiements → ✏️ → Version : Nouvelle version → Déployer**
4. L'URL du web app doit rester inchangée — sinon il faut mettre à jour `STATS_URL`
   dans `js/config.js`.

Le compte qui déploie (`Exécuter en tant que : Moi`) doit avoir accès en
Éditeur à **chaque Google Sheet** référencé dans `CLIENTS`.

## Développement local

```sh
# Servir les fichiers en local (n'importe quel serveur HTTP statique)
python3 -m http.server 8000
# Puis ouvrir http://localhost:8000/?client=france-literie-perpignan
```

Le protocole `file://` fonctionne aussi, mais certains navigateurs bloquent
les requêtes `fetch` cross-origin depuis un fichier local.

## Déploiement

Hébergeur : **Vercel** (ou Netlify).
- Push `main` → déploiement automatique.
- Pas de variables d'environnement nécessaires (tout est dans `config.js`).
- URL stable utilisée comme `src` d'iframe depuis Webflow.
