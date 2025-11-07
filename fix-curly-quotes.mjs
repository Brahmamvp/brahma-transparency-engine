import { readdirSync, readFileSync, writeFileSync, statSync } from 'fs';
import { join } from 'path';
const exts = ['.js','.jsx','.ts','.tsx','.css'];
function walk(dir){
  for (const name of readdirSync(dir)) {
    const p = join(dir,name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p);
    else if (exts.some(ext=>p.endsWith(ext))) {
      let txt = readFileSync(p,'utf8');
      const out = txt
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201C\u201D]/g, '"');
      if (out !== txt) writeFileSync(p, out);
    }
  }
}
walk('src');
console.log('✔ Replaced curly quotes in src/');
