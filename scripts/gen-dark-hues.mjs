// Génère src/theme-hues-dark.css : en thème sombre, les rampes de couleur Tailwind utilisées dans l'app
// sont inversées (50 = teinte sombre, 900 = teinte très claire) à partir d'une couleur pastel par teinte.
// Usage : node scripts/gen-dark-hues.mjs
import { writeFileSync } from 'node:fs';

const NIGHT = '#161830'; // fond de référence du thème Nuit douce
const HUES = {
	amber: '#F5C27A',
	emerald: '#7FD8B0',
	rose: '#F49AB0',
	red: '#F28B8B',
	orange: '#F7AE84',
	sky: '#8CC8F2',
	indigo: '#A5A8F5',
	violet: '#C3AEFF',
	teal: '#7FD6CB',
	pink: '#F2A2CC',
	fuchsia: '#E3A6F2'
};
// Part de la couleur pastel mélangée au fond (stops clairs) ou au blanc (stops foncés).
const ON_NIGHT = { 50: 14, 100: 22, 200: 32, 300: 48, 400: 68, 500: 85, 600: 100 };
const ON_WHITE = { 700: 75, 800: 60, 900: 45, 950: 35 };

let css = '/* Généré par scripts/gen-dark-hues.mjs, ne pas modifier à la main. */\n[data-theme=\'dark\'] {\n';
for (const [hue, base] of Object.entries(HUES)) {
	for (const [stop, p] of Object.entries(ON_NIGHT))
		css += `\t--color-${hue}-${stop}: color-mix(in oklab, ${base} ${p}%, ${NIGHT});\n`;
	for (const [stop, p] of Object.entries(ON_WHITE))
		css += `\t--color-${hue}-${stop}: color-mix(in oklab, ${base} ${p}%, #ffffff);\n`;
}
css += '}\n';
writeFileSync(new URL('../src/theme-hues-dark.css', import.meta.url), css);
console.log('src/theme-hues-dark.css écrit');
