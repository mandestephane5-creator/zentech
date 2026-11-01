# ZenTech Backend — Guide de démarrage

## Installation (une seule fois)

```bash
cd zentech/server
npm install
```

## Lancer le serveur

```bash
cd zentech/server
node server.js
```

Le terminal affiche :
```
╔══════════════════════════════════════╗
║     ZenTech Backend — v1.0.0         ║
╠══════════════════════════════════════╣
║  Site     : http://localhost:3000    ║
║  Dashboard: http://localhost:3000/dashboard.html ║
║  API      : http://localhost:3000/api ║
╚══════════════════════════════════════╝
```

## Accès

| Page | URL |
|------|-----|
| Site client | http://localhost:3000 |
| Dashboard admin | http://localhost:3000/dashboard.html |

## Mot de passe admin

```
zentech2025
```
(modifiable dans server/data/config.json)

## Routes API disponibles

### Produits (public)
- GET    /api/produits         — liste tous les produits
- GET    /api/produits/:id     — un produit
- POST   /api/produits         — ajouter (admin)
- PUT    /api/produits/:id     — modifier (admin)
- DELETE /api/produits/:id     — supprimer (admin)

### Commandes (admin sauf POST)
- GET    /api/commandes        — toutes les commandes
- GET    /api/commandes/stats  — statistiques
- POST   /api/commandes        — nouvelle commande (site)
- PUT    /api/commandes/:id/statut — changer statut

### Stocks (admin)
- GET    /api/stocks           — état des stocks
- GET    /api/stocks/alertes   — stocks faibles
- GET    /api/stocks/historique — historique mouvements
- POST   /api/stocks/mouvement — ajouter/retirer

### Clients (admin)
- GET    /api/clients          — liste clients
- GET    /api/clients/:tel     — chercher par téléphone
- POST   /api/clients          — ajouter
- DELETE /api/clients/:id      — supprimer

## Modifier le mot de passe admin

Ouvrir `server/data/config.json` et changer :
```json
"mot_de_passe": "VOTRE_NOUVEAU_MOT_DE_PASSE"
```

## Structure des fichiers

```
zentech/
├── index.html
├── dashboard.html
├── css/
├── img/
├── js/
│   ├── app.js          ← connecté au backend
│   └── dashboard.js    ← connecté au backend
└── server/
    ├── server.js
    ├── package.json
    ├── data/
    │   ├── produits.json
    │   ├── commandes.json
    │   ├── clients.json
    │   ├── stocks.json
    │   └── config.json
    ├── routes/
    │   ├── produits.js
    │   ├── commandes.js
    │   ├── stocks.js
    │   └── clients.js
    └── middleware/
        └── auth.js
```
