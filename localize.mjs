import fs from 'fs';
import https from 'https';
import path from 'path';

const LIBS = [
  { name: 'babel.min.js', url: 'https://unpkg.com/@babel/standalone@7.24.4/babel.min.js' },
  { name: 'react.production.min.js', url: 'https://unpkg.com/react@19.0.0/umd/react.production.min.js' },
  { name: 'react-dom.production.min.js', url: 'https://unpkg.com/react-dom@19.0.0/umd/react-dom.production.min.js' }
];

const libsDir = path.join(process.cwd(), 'public', 'libs');

if (!fs.existsSync(libsDir)) {
  fs.mkdirSync(libsDir, { recursive: true });
}

async function download(lib) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(path.join(libsDir, lib.name));
    https.get(lib.url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to get '${lib.name}' (${response.statusCode})`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`[Localizer] Downloaded: ${lib.name}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(path.join(libsDir, lib.name), () => {});
      reject(err);
    });
  });
}

async function main() {
  console.log('[Localizer] Starting sovereign localization...');
  for (const lib of LIBS) {
    try {
      await download(lib);
    } catch (e) {
      console.error(`[Localizer] Error downloading ${lib.name}:`, e.message);
    }
  }
  console.log('[Localizer] COMPLETE.');
}

main();
