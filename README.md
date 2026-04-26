# 🌈 Brick Breaqueer

**Brick Breaqueer** est un jeu de casse-briques revisité, alliant le gameplay classique de l'arcade à une mission de sensibilisation et d'inclusion. 

Brisez les murs de l'intolérance (littéralement !) pour révéler les drapeaux et l'histoire des communautés LGBTQ2S+.

## ✨ Caractéristiques

* **Gameplay Classique & Fluide** : Propulsé par Phaser 4 avec une physique Arcade précise.
* **Esthétique Miroir** : Des briques opaques au fini "miroir poli" qui éclatent en une pluie de particules multicolores.
* **Contenu Éducatif** : Chaque niveau révélé affiche un drapeau spécifique et un court texte historique sur ses origines.
* **Système de Combo** : Détruisez les briques rapidement pour faire apparaître des mots représentant les préjugés que vous êtes en train d'anéantir.
* **Effets Visuels** : Traînée de balle arc-en-ciel et explosions de particules dynamiques.

## 🚀 Installation et Utilisation

Ce jeu est conçu comme un module JavaScript utilisant la bibliothèque **Phaser 4**.

### Prérequis
* Un environnement Node.js (pour la gestion des dépendances).
* Phaser 3 installé dans votre projet :
    ```bash
    npm install
    ```

### Intégration
Importez la classe dans votre projet et initialisez-la avec les paramètres souhaités :

```javascript
import RainbowBreaker from './rainbowbreaker.js';

const settings = {
    parent: 'game-container',
    width: 800,
    height: 600,
    onGameOver: (stats) => {
        console.log("Score final :", stats.score);
    }
};

RainbowBreaker.init(settings);