import RainbowBreaker from "./libraries/rainbowbreaker";

const gameSettings = {
    parent: "game-container",
    width: 800,
    height: 600,
    // Callback asynchrone pour le modal de score
    onGameOver: async (stats) => {
        console.log("Stats de fin de partie :", stats);
        
        return new Promise((resolve) => {
            // Ici, tu déclencheras l'affichage de ton modal HTML
            // Le jeu restera bloqué tant que resolve() n'est pas appelé
            // Exemple : simuler une pause de 2 secondes
            setTimeout(() => {
                console.log("Modal fermé");
                resolve();
            }, 2000);
        });
    }
};

RainbowBreaker.init(gameSettings);