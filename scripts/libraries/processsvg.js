import { JSDOM } from 'jsdom';

/**
 * Encode un string SVG de manière optimisée pour les Data URIs (plus léger que Base64).
 */
function miniEncodeSvg(svgString) {
    return svgString
        .trim()
        .replace(/"/g, "'") // Utilise des simples quotes pour éviter les conflits
        .replace(/>\s+</g, '><') // Minifie les espaces entre les balises
        .replace(/%/g, '%25')
        .replace(/</g, '%3C')
        .replace(/>/g, '%3E')
        .replace(/#/g, '%23')
        + '%0A';
}

/**
 * Redimensionne un SVG et retourne une Data URI.
 * @param {string} content - Le contenu texte (XML) du SVG.
 * @param {number} maxwidth - La largeur cible souhaitée.
 * @returns {string} - La Data URI formatée.
 */
export function processSvg(content, maxwidth) {
    // Utilisation de JSDOM pour manipuler le XML du SVG
    const dom = new JSDOM(content, { contentType: "image/svg+xml" });
    const svgElement = dom.window.document.querySelector("svg");

    if (!svgElement) {
        throw new Error("SVG invalide ou élément <svg> introuvable.");
    }

    // Gestion du redimensionnement via la viewBox
    const viewBox = svgElement.getAttribute("viewBox");
    if (viewBox) {
        const [, , w, h] = viewBox.split(/\s+/);
        const newHeight = (maxwidth * h / w).toFixed(3); // Calcule la hauteur proportionnelle
        
        svgElement.setAttribute("width", maxwidth);
        svgElement.setAttribute("height", newHeight);
    } else {
        // Si pas de viewBox, on force juste la largeur demandée
        svgElement.setAttribute("width", maxwidth);
    }

    // Retourne le SVG encodé sous forme de Data URI
    return `data:image/svg+xml;charset=utf-8,${miniEncodeSvg(svgElement.outerHTML)}`;
}