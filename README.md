# FluxClientFL — Suivi Magasin

Dashboard web embarqué dans [tarmaac.io](https://www.tarmaac.io) pour le suivi en temps
réel des flux clients en point de vente (entrées, ventes, appels).
Suivi Magasin est un tableau de bord en ligne qui vous permet         
d'enregistrer en temps réel chaque entrée client, vente ou appel passé
en boutique. 
Vous accédez ensuite à des statistiques claires :      
chiffre d'affaires, taux de conversion, sources de trafic, produits   
les plus vendus. L'outil vous aide à comprendre ce qui fonctionne et à
piloter votre activité sans tableur ni paperasse. Le tout aux
couleurs de votre enseigne, prêt à l'emploi, sans installation.

## Architecture

```
FluxClientFL/
├── index.html           # Structure HTML (shell)
├── img
    ├── PNGs
├── css/
│   └── main.css         # Tous les styles
├── js/
│   ├── config.js        # THEMES + CLIENTS + résolution du client (charge en <head>)
│   ├── branding.js      # Applique thème/logo/nom au DOM (charge en fin de body)
│   ├── saisie.js        # Formulaire + POST vers Apps Script
│   ├── stats.js         # Datepicker + GET stats + rendu
│   └── app.js           # Horloge, onglets, sync iframe
└── README.md
```
