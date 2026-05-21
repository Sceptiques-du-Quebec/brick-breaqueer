# 🌈 Brick Breaqueer

**Brick Breaqueer** est un jeu de casse-briques revisité, alliant le gameplay classique de l'arcade à une mission de sensibilisation et d'inclusion.

Brisez les murs de l'intolérance (littéralement !) pour révéler les drapeaux et l'histoire des communautés LGBTQ2S+.

## ✨ Caractéristiques

* **Gameplay Classique & Fluide** : Propulsé par Phaser 4 avec une physique Arcade précise.
* **Esthétique Miroir** : Des briques opaques au fini "miroir poli" qui éclatent en une pluie de particules multicolores.
* **Contenu Éducatif** : Chaque niveau révélé affiche un drapeau spécifique et un court texte historique sur ses origines.
* **Système de Combo** : Détruisez les briques rapidement pour faire apparaître des mots représentant les préjugés que vous êtes en train d'anéantir.
* **Effets Visuels** : Traînée de balle arc-en-ciel et explosions de particules dynamiques.

## 🚀 Installation et développement local

### Prérequis

* [Node.js](https://nodejs.org/) 20 ou plus récent
* npm (inclus avec Node.js)

### Étapes

```bash
# Installer les dépendances
npm ci

# Compiler la configuration YAML → JSON
npm run conf

# Bundler le JavaScript
npm run build

# Copier les fichiers dans dist/
npm run export
```

Le jeu est ensuite disponible dans le dossier `dist/`. Ouvrez `dist/index.html` dans un navigateur local (via un serveur statique, p. ex. `npx serve dist`).

## 📦 Intégration dans une page web

Le build produit `brickbreaqueer.core.min.js`, un bundle JavaScript autonome. Pour l'intégrer :

```html
<div id="game-container"></div>
<script>
    const script = document.createElement('script');
    script.src = 'scripts/brickbreaqueer.core.min.js';
    script.async = true;
    script.onload = () => {
        BrickBreaqueer({
            parent: 'game-container',
            width: 664,
            height: 498,
            fontFamily: 'Unbounded',
            fontWeight: 500,
            color: '#161616',
            effets: false,
            music: true,
            onLoadComplete: async () => {
                document.querySelector('#game-container').classList.add('loaded');
            },
            onGameOver: async (stats) => {
                console.log('Stats de fin de partie :', stats);
            }
        });
    };
    document.head.appendChild(script);
</script>
```

Consultez `src/index.html` pour un exemple complet d'intégration, incluant le CSS du conteneur et la gestion du chargement.

## 🗂️ Structure du projet

```
src/
  index.html                         # Page de démonstration
  scripts/
    brickbreaqueer.core.js           # Point d'entrée du bundle (expose BrickBreaqueer)
    brickbreaqueer.core.min.js       # Bundle généré par npm run build
    libraries/
      rainbowbreaker.js              # Scène Phaser principale (toute la logique de jeu)
      rainbowbreaker.yaml            # Source des données : drapeaux, textes, config, assets
      rainbowbreaker.json            # Généré par npm run conf (ne pas modifier à la main)
scripts/
  conf.js                            # Compile rainbowbreaker.yaml → rainbowbreaker.json
  build.js                           # Bundle JS avec chokibasic
  export.js                          # Copie src/ vers dist/
dist/                                # Produit par npm run export (non suivi par git)
```

> **Note** : `rainbowbreaker.json` et `brickbreaqueer.core.min.js` sont des fichiers générés. Pour ajouter du contenu (drapeaux, textes, configuration), modifiez `rainbowbreaker.yaml`, puis relancez `npm run conf` et `npm run build`.

## 🤝 Contribuer

Exemples de contributions possibles :

* Corriger une traduction ou un texte historique dans `rainbowbreaker.yaml`
* Améliorer le gameplay ou les effets visuels dans `rainbowbreaker.js`
* Proposer un nouveau drapeau ou thème, idéalement en ouvrant d'abord une issue pour validation avec les mainteneurs

Les mainteneurs restent responsables de prioriser, accepter ou refuser les contributions proposées.

Merci de respecter l'esprit inclusif et éducatif du projet dans toute contribution.
