# 🌈 Brick Breaqueer

**Brick Breaqueer** est un jeu de casse-briques LGBTQ2S+ qui combine un gameplay d’arcade classique avec une mission de sensibilisation, d’inclusion et de découverte.

Le principe est simple : briser les murs de l’intolérance pour révéler des drapeaux, des couleurs et de courts textes liés à l’histoire des communautés LGBTQ2S+.

---

## ✨ Caractéristiques

- **Gameplay arcade** : casse-briques inspiré des classiques du genre.
- **Moteur Phaser 4** : rendu web avec physique Arcade.
- **Contenu éducatif** : chaque niveau peut révéler un drapeau et un court texte historique.
- **Données configurables** : drapeaux, textes, paramètres et ressources sont définis dans `rainbowbreaker.yaml`.
- **Effets visuels** : particules, traînée arc-en-ciel, effets de “bump” et transitions visuelles.
- **Bonus de jeu** : bonus tombants comme cœur, licorne et arc-en-ciel.
- **Support clavier, souris et tactile** : selon les contrôles déjà configurés dans le jeu.

---

## 🚀 Développement local

### Prérequis

- [Node.js](https://nodejs.org/) 20 ou plus récent
- npm, inclus avec Node.js

Vérifier l’installation :

```bash
node --version
npm --version
```

---

## 📦 Installation

Installer les dépendances du projet :

```bash
npm ci
```

`npm ci` installe les dépendances à partir du fichier `package-lock.json`. C’est la commande recommandée pour reproduire l’environnement du projet de manière stable.

---

## 🛠️ Commandes utiles

### Générer la configuration JSON

```bash
npm run conf
```

Cette commande convertit :

```text
src/scripts/libraries/rainbowbreaker.yaml
```

en :

```text
src/scripts/libraries/rainbowbreaker.json
```

Le fichier YAML est la source éditable. Le fichier JSON est généré.

### Construire le bundle JavaScript

```bash
npm run build
```

Cette commande génère le bundle JavaScript minifié :

```text
src/scripts/brickbreaqueer.core.min.js
```

### Exporter le site / jeu

```bash
npm run export
```

Cette commande copie les fichiers nécessaires dans le dossier :

```text
dist/
```

Le dossier `dist/` contient la version prête à être testée ou déployée.

---

## ▶️ Tester localement

Après avoir lancé :

```bash
npm ci
npm run conf
npm run build
npm run export
```

vous pouvez servir le dossier `dist/` avec un petit serveur local.

Avec Python :

```bash
cd dist
python -m http.server 5500
```

Puis ouvrir :

```text
http://127.0.0.1:5500/
```

Si `python` n’est pas reconnu, essayer :

```bash
py -m http.server 5500
```

Éviter de tester uniquement en double-cliquant sur `dist/index.html`, car certains chemins peuvent se comporter différemment en mode `file://`.

---

## 📦 Intégration dans une page web

Le build produit un bundle autonome :

```text
src/scripts/brickbreaqueer.core.min.js
```

Exemple d’intégration :

```html
<div id="game-container"></div>

<script>
    const script = document.createElement("script");
    script.src = "scripts/brickbreaqueer.core.min.js";
    script.async = true;

    script.onload = () => {
        BrickBreaqueer({
            parent: "game-container",
            width: 664,
            height: 498,
            fontFamily: "Unbounded",
            fontWeight: 500,
            color: "#161616",
            effets: false,
            music: true,
            onLoadComplete: async () => {
                document.querySelector("#game-container")?.classList.add("loaded");
            },
            onGameOver: async (stats) => {
                console.log("Stats de fin de partie :", stats);
            }
        });
    };

    document.head.appendChild(script);
</script>
```

Consulter `src/index.html` pour un exemple complet d’intégration, incluant le conteneur, les styles et la gestion du chargement.

---

## 🗂️ Structure du projet

```text
src/
  index.html
    Page de démonstration du jeu.

  scripts/
    brickbreaqueer.core.js
      Point d’entrée du bundle. Expose la fonction globale BrickBreaqueer.

    brickbreaqueer.core.min.js
      Bundle généré par npm run build. Ne pas modifier à la main.

    libraries/
      rainbowbreaker.js
        Scène Phaser principale. Contient la logique de jeu.

      rainbowbreaker.yaml
        Source éditable des données : drapeaux, textes, configuration et assets.

      rainbowbreaker.json
        Fichier généré par npm run conf. Ne pas modifier à la main.

scripts/
  conf.js
    Convertit rainbowbreaker.yaml en rainbowbreaker.json.

  build.js
    Génère le bundle JavaScript avec chokibasic.

  export.js
    Copie les fichiers nécessaires dans dist/.

dist/
  Version exportée du jeu. Générée par npm run export.
```

---

## 📝 Modifier le contenu éducatif

Les textes, drapeaux et paramètres principaux sont définis dans :

```text
src/scripts/libraries/rainbowbreaker.yaml
```

Pour modifier ou ajouter du contenu :

1. Modifier `rainbowbreaker.yaml`.
2. Lancer :

```bash
npm run conf
npm run build
npm run export
```

3. Tester localement dans `dist/`.

Ne pas modifier directement `rainbowbreaker.json`, car ce fichier est généré automatiquement.

---

## 🎮 Modifier le gameplay

La logique principale du jeu se trouve dans :

```text
src/scripts/libraries/rainbowbreaker.js
```

Avant de proposer une modification de gameplay, il est préférable de garder le changement petit et ciblé : un bug, un écran, un effet, une mécanique ou une amélioration à la fois.

---

## 🤝 Contribuer

Exemples de contributions possibles :

- corriger une faute ou une traduction dans les textes ;
- améliorer une instruction de développement ;
- proposer un ajustement visuel ;
- corriger un bug ciblé ;
- améliorer l’accessibilité ;
- proposer un nouveau contenu éducatif, idéalement avec source ou contexte.

Pour les changements de contenu, de ton ou d’identité visuelle, il est préférable d’ouvrir une issue ou d’en discuter avec les mainteneurs avant de préparer une grosse modification.

Les mainteneurs restent responsables de prioriser, accepter ou refuser les contributions proposées.

---

## ✅ Validation avant une pull request

Avant d’ouvrir une PR, lancer idéalement :

```bash
npm ci
npm run conf
npm run build
npm run export
npm audit --omit=dev
```

Puis vérifier l’état Git :

```bash
git diff --check
git status --short
```

Les fichiers générés comme `rainbowbreaker.json` et `brickbreaqueer.core.min.js` peuvent changer après le build. Ne les inclure dans une PR que si c’est volontaire.

---

## 📄 Licence

Consulter le fichier `LICENSE` du dépôt.