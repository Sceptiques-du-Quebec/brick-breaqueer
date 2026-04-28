import RainbowBreaker from "./libraries/rainbowbreaker";



// self.loadScript = function(endpoint, params = {}, isAsync = false) {
//     return new Promise((resolve, reject) => {
//         const url = new URL(endpoint);
//         Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

//         const script = document.createElement('script');
//         script.src = url.toString();
//         script.async = isAsync;

//         // Succès : le script est chargé et exécuté
//         script.onload = () => resolve(script);

//         // Erreur : problème de réseau ou URL invalide
//         script.onerror = () => reject(new Error(`Échec du chargement du script : ${url}`));

//         document.head.appendChild(script);
//     });
// };

document.fonts.load('10pt "Unbounded"').then(() => {
    const gameSettings = {
        parent: "game-container",
        width: 664,
        height: 498,
        fontFamily: "Unbounded",
        fontWeight: 500,
        color: '#161616',
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
});


