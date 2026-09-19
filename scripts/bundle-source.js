import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

const rootDir = process.cwd();
const zip = new JSZip();

const IGNORED_PATHS = [
  'node_modules',
  '.git',
  'dist',
  'dev-dist',
  '.DS_Store',
  'public/xernotes-source.zip',
  'public/xernotes-project.zip'
];

function shouldInclude(filePath) {
  const relPath = path.relative(rootDir, filePath).replace(/\\/g, '/');
  for (const ignored of IGNORED_PATHS) {
    if (relPath === ignored || relPath.startsWith(ignored + '/')) {
      return false;
    }
  }
  return true;
}

function addFilesRecursively(dirPath, zipFolder) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (!shouldInclude(fullPath)) continue;

    if (entry.isDirectory()) {
      const subFolder = zipFolder.folder(entry.name);
      addFilesRecursively(fullPath, subFolder);
    } else if (entry.isFile()) {
      const content = fs.readFileSync(fullPath);
      zipFolder.file(entry.name, content);
    }
  }
}

console.log('Generating project source ZIP...');
addFilesRecursively(rootDir, zip);

// Add a clear APK building guide inside the ZIP
const apkGuide = `# Xernotes - Source Code & APK Build Guide

This ZIP contains the complete source code for Xernotes.

## 1. How to run locally:
\`\`\`bash
npm install
npm run dev
\`\`\`
Visit http://localhost:3000

## 2. How to build web production bundle:
\`\`\`bash
npm run build
\`\`\`
This generates the standalone production static files in the \`dist/\` folder.

## 3. How to build Android .APK file:

### Option A: Using Capacitor (Recommended - Official & Easiest)
1. In this project folder, install Capacitor:
   \`npm install @capacitor/core @capacitor/cli @capacitor/android\`
2. Initialize Capacitor:
   \`npx cap init Xernotes com.xernotes.app --web-dir dist\`
3. Build the web app:
   \`npm run build\`
4. Add the Android platform:
   \`npx cap add android\`
5. Sync code:
   \`npx cap sync\`
6. Open Android Studio to build signed APK:
   \`npx cap open android\`
   Inside Android Studio, click **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
   Your \`.apk\` will be in \`android/app/build/outputs/apk/debug/app-debug.apk\`!

### Option B: Using Cordova
1. \`npm install -g cordova\`
2. \`cordova create xernotes-app com.xernotes.app Xernotes\`
3. Copy \`dist/*\` into \`xernotes-app/www/\`
4. \`cd xernotes-app && cordova platform add android\`
5. \`cordova build android\` (Outputs .apk in \`platforms/android/app/build/outputs/apk/\`)
`;

zip.file('APK_BUILD_INSTRUCTIONS.md', apkGuide);

zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 9 } })
  .then((buffer) => {
    const outputPath = path.join(rootDir, 'public', 'xernotes-source.zip');
    fs.writeFileSync(outputPath, buffer);
    console.log('Successfully created:', outputPath, `(${Math.round(buffer.length / 1024)} KB)`);
  })
  .catch((err) => {
    console.error('Error generating zip:', err);
    process.exit(1);
  });
