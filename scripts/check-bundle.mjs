import fs from 'node:fs';
import vm from 'node:vm';

const loader = fs.readFileSync('app-loader.js', 'utf8');
const match = loader.match(/const parts\s*=\s*(\[[\s\S]*?\]);/);
if (!match) throw new Error('Could not find the app part list in app-loader.js');

const parts = JSON.parse(match[1]);
const missing = parts.filter(path => !fs.existsSync(path));
if (missing.length) throw new Error(`Missing app parts: ${missing.join(', ')}`);

const source = parts.map(path => fs.readFileSync(path, 'utf8')).join('\n');
new vm.Script(source, { filename: 'bto-layout-studio.bundle.js' });
console.log(`Bundle syntax OK: ${parts.length} parts, ${source.length} characters.`);
