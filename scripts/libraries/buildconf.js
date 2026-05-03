import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import { JSDOM } from 'jsdom';

const ROOT = process.cwd();


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


async function walkAndTransform(node, callback) {
	if (Array.isArray(node)) return await Promise.all(node.map(item => walkAndTransform(item, callback)));
	if (typeof node === 'object' && node !== null) {
		const newNode = {};
		for (const [key, value] of Object.entries(node)) newNode[key] = await walkAndTransform(value, callback);
		return newNode;
	}
	if (typeof node === 'string' && node.toLowerCase().endsWith('.svg')) {
		const fullPath = path.join(ROOT, node);
		try {
			const stats = await fs.stat(fullPath);
			if (stats.isFile()) return await callback(fullPath);
		} catch (err) {
			console.warn(`⚠️ Fichier SVG introuvable : ${fullPath}`);
		}
	}
	return node;
}


async function loadConfig(src) {
	const fileContents = await fs.readFile(src, 'utf8');
	const rawData = yaml.load(fileContents);
	const processedData = await walkAndTransform(rawData, async (absolutePath) => { return processSvgToUri(absolutePath, rawData.config.width); });
	return processedData;
}


export default async function buildConf(src, dst) {
	try {
		const conf = await loadConfig(src);
		const jsonContent = JSON.stringify(conf);
		await fs.writeFile(dst, jsonContent, 'utf8');
		console.log("✅ Configuration terminée avec succès !");
	} catch (error) {
		console.error("❌ Erreur lors de la configuration :", error);
	}
}