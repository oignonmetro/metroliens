# Métroliens

Un puzzle quotidien : trouver mentalement l'itinéraire le plus rapide dans le métro parisien.

## Lancer le jeu en local

```bash
npm install
npm run dev
```

Puis ouvrir l'adresse affichée (en général http://localhost:5173/metroliens/).

## Mettre le jeu en ligne avec GitHub Pages

Le projet est configuré pour se déployer tout seul. Une fois la configuration faite, il suffira de pousser ton code pour mettre le site à jour.

### Étape 1 : créer le dépôt sur GitHub

1. Sur GitHub, clique sur le **+** en haut à droite, puis **New repository**.
2. Nomme-le exactement **`metroliens`** (important : ce nom doit correspondre à la ligne `base` du fichier `vite.config.js`).
3. Laisse-le **public**, ne coche rien d'autre, puis **Create repository**.

> Si tu choisis un autre nom de dépôt, ouvre `vite.config.js` et remplace `/metroliens/` par `/le-nom-de-ton-depot/`.

### Étape 2 : envoyer le code

Dans un terminal, place-toi dans ce dossier et exécute (en remplaçant `TON-PSEUDO`) :

```bash
git init
git add .
git commit -m "Premier dépôt de Métroliens"
git branch -M main
git remote add origin https://github.com/TON-PSEUDO/metroliens.git
git push -u origin main
```

### Étape 3 : activer GitHub Pages

1. Sur la page du dépôt, va dans **Settings** (Paramètres).
2. Dans le menu de gauche, clique sur **Pages**.
3. Sous **Build and deployment**, pour **Source**, choisis **GitHub Actions**.

C'est tout. GitHub va automatiquement construire et publier le site. Après une à deux minutes, ton jeu sera en ligne à l'adresse :

```
https://TON-PSEUDO.github.io/metroliens/
```

### Mettre à jour le jeu plus tard

À chaque fois que tu modifies le code, il suffit de pousser les changements :

```bash
git add .
git commit -m "Description de la modification"
git push
```

Le site se met à jour tout seul en une à deux minutes.

## Notes techniques

- Le puzzle du jour est choisi selon le nombre de jours écoulés depuis le 1er janvier 2025, ce qui garantit une rotation régulière.
- Le score, la série de jours consécutifs et le verrouillage « une partie par jour » sont stockés dans le navigateur du joueur (`localStorage`). Ils ne fonctionnent donc qu'une fois le jeu déployé en ligne, pas dans un aperçu restreint.
- Aucune donnée n'est envoyée à un serveur : tout se passe dans le navigateur.
