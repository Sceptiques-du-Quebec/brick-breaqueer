const loadScript = function(endpoint, params = {}, isAsync = true) {
    return new Promise((resolve, reject) => {
        const url = new URL(endpoint);
        Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
        const script = document.createElement('script');
        script.src = url.toString();
        script.async = isAsync;
        script.onload = () => resolve(script);
        script.onerror = () => reject(new Error(`Échec du chargement du script : ${url}`));
        document.head.appendChild(script);
    });
};


(async () => {
    await loadScript(new URL('scripts/brickbreaqueer.core.min.js', window.location).href);
    BrickBreaqueer({
        parent: "game-container",
        width: 664,
        height: 498,
        fontFamily: "Unbounded",
        fontWeight: 500,
        color: '#161616',
        onGameOver: async (stats) => {
            console.log("Stats de fin de partie :", stats);
            return new Promise((resolve) => {
                setTimeout(() => {
                    console.log("Modal fermé");
                    resolve();
                }, 2000);
            });
        }
    });
})();