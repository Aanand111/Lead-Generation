const fs = require('fs');
const path = require('path');

const constructors = new Set([
  'Image', 'Option', 'Audio', 'Video', 'File', 'Map', 'Set', 'Range', 'Selection', 
  'Plugin', 'Notification', 'MessagePort', 'Worker', 'Event', 'Storage', 'Blob', 'History'
]);

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach( f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const srcDir = 'd:/Workspace/LeadgenrationApp/frontend/src';

walkDir(srcDir, (filePath) => {
  if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
    const content = fs.readFileSync(filePath, 'utf8');
    const importRegex = /import\s+\{([^}]+)\}\s+from\s+'lucide-react'/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const icons = match[1].split(',').map(s => s.trim());
      icons.forEach(icon => {
        const iconName = icon.split(' as ')[0].trim();
        if (constructors.has(iconName) && !icon.includes(' as ')) {
          console.log(`[FOUND] problematic icon "${iconName}" in ${filePath}`);
        }
      });
    }
  }
});
