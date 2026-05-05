/**
 * Convertit un contenu binaire MP3 en Data URI Base64.
 * @param {Buffer|Uint8Array} content - Le binaire du fichier MP3.
 * @returns {string} - La chaîne data:audio/mp3;base64,...
 */
export function processMp3(content) {
    // Si le contenu est déjà un Buffer, on l'utilise, sinon on le convertit
    const buffer = Buffer.isBuffer(content) ? content : Buffer.from(content);
    
    const base64 = buffer.toString('base64');
    return `data:audio/mp3;base64,${base64}`;
}