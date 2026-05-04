import fs from 'fs/promises';
import path from 'path';

// On récupère l'ID depuis les arguments de la ligne de commande
const fileId = process.argv[2];

if (!fileId) {
    console.error("Erreur : Veuillez fournir un ID. (ex: node download-sound.js 0810_GeneralUserGS_sf2_file)");
    process.exit(1);
}


const ROOT = process.cwd();
const DEST = path.join(ROOT, `assets/audiofonts/${fileId}.json`);


const url = `https://surikov.github.io/webaudiofontdata/sound/${fileId}.js`;

async function downloadAndConvert() {
    try {
        console.log(`📡 Téléchargement de : ${fileId}...`);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const rawContent = await response.text();

        // Extraction de l'objet JS entre les premières '{' et les dernières '}'
        const firstBrace = rawContent.indexOf('{');
        const lastBrace = rawContent.lastIndexOf('}');

        if (firstBrace === -1 || lastBrace === -1) {
            throw new Error("Format de fichier invalide : structure d'objet introuvable.");
        }

        const objectString = rawContent.substring(firstBrace, lastBrace + 1);

        // Transformation de la chaîne en objet JavaScript
        // On utilise 'new Function' car le contenu n'est pas du JSON strict (clés sans guillemets, etc.)
        const data = new Function(`return ${objectString}`)();

        // Sauvegarde en format JSON
        // const outputFilename = `${fileId}.json`;
        await fs.writeFile(DEST, JSON.stringify(data, null, 2));

        console.log(`✅ Terminé ! Fichier créé : ${DEST}`);
    } catch (error) {
        console.error(`❌ Échec : ${error.message}`);
    }
}

downloadAndConvert();