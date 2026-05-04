import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import { JSDOM } from 'jsdom';

const ROOT = process.cwd();

// --- Utilitaires de conversion ---

function miniEncodeSvg(svgString) {
    return svgString
        .trim()
        .replace(/"/g, "'")
        .replace(/>\s+</g, '><')
        .replace(/%/g, '%25')
        .replace(/</g, '%3C')
        .replace(/>/g, '%3E')
        .replace(/#/g, '%23')
        + '%0A';
}

async function processSvgToUri(absolutePath, maxwidth) {
    const rawSvg = await fs.readFile(absolutePath, 'utf8');
    const dom = new JSDOM(rawSvg, { contentType: "image/svg+xml" });
    const svgElement = dom.window.document.querySelector("svg");
    if (!svgElement) throw new Error(`SVG invalide: ${absolutePath}`);
    const viewBox = svgElement.getAttribute("viewBox");
    if (viewBox) {
        const [, , w, h] = viewBox.split(/\s+/);
        const newHeight = (maxwidth * h / w).toFixed(3);
        svgElement.setAttribute("width", maxwidth);
        svgElement.setAttribute("height", newHeight);
    }
    return `data:image/svg+xml;charset=utf-8,${miniEncodeSvg(svgElement.outerHTML)}`;
}

/**
 * Lit un fichier audio (MP3 ou MIDI) et le transforme en Data URI Base64
 */
async function processAudioToUri(absolutePath) {
    const buffer = await fs.readFile(absolutePath);
    const base64 = buffer.toString('base64');
    const ext = path.extname(absolutePath).toLowerCase();
    
    // Détermination du type MIME selon l'extension
    let mimeType = 'audio/mp3'; 
    if (ext === '.mid' || ext === '.midi') {
        mimeType = 'audio/midi';
    }
    
    return `data:${mimeType};base64,${base64}`;
}

// --- Logique de parcours (Walk) ---

async function walkAndTransform(node, callbackSvg, callbackAudio) {
    if (Array.isArray(node)) {
        return await Promise.all(node.map(item => walkAndTransform(item, callbackSvg, callbackAudio)));
    }
    
    if (typeof node === 'object' && node !== null) {
        const newNode = {};
        for (const [key, value] of Object.entries(node)) {
            newNode[key] = await walkAndTransform(value, callbackSvg, callbackAudio);
        }
        return newNode;
    }

    if (typeof node === 'string') {
        const lowerNode = node.toLowerCase();
        const fullPath = path.join(ROOT, node);

        // Gestion SVG
        if (lowerNode.endsWith('.svg')) {
            try {
                const stats = await fs.stat(fullPath);
                if (stats.isFile()) return await callbackSvg(fullPath);
            } catch (err) {
                console.warn(`⚠️ Fichier SVG introuvable : ${fullPath}`);
            }
        } 
        // Gestion Audio (MP3 et MIDI)
        else if (lowerNode.endsWith('.mp3') || lowerNode.endsWith('.mid') || lowerNode.endsWith('.midi')) {
            try {
                const stats = await fs.stat(fullPath);
                if (stats.isFile()) return await callbackAudio(fullPath);
            } catch (err) {
                console.warn(`⚠️ Fichier audio introuvable : ${fullPath}`);
            }
        }
    }
    return node;
}

// --- Chargement et Build ---

async function loadConfig(src) {
    const fileContents = await fs.readFile(src, 'utf8');
    const rawData = yaml.load(fileContents);
    
    const processedData = await walkAndTransform(
        rawData, 
        async (path) => processSvgToUri(path, rawData.config.width), // callbackSvg
        async (path) => processAudioToUri(path)                      // callbackAudio (gère MP3 & MIDI)
    );
    
    return processedData;
}

export default async function buildConf(src, dst) {
    try {
        const conf = await loadConfig(src);
        const jsonContent = JSON.stringify(conf); 
        await fs.writeFile(dst, jsonContent, 'utf8');
        console.log("✅ Configuration terminée avec succès!");
    } catch (error) {
        console.error("❌ Erreur lors de la configuration :", error);
    }
}