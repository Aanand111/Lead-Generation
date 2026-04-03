const fs = require('fs');
const path = require('path');

const srcDir = 'd:/Workspace/LeadgenrationApp/frontend/src';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach( f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const problematicIcons = {
  'Image': 'ImageIcon',
  'History': 'HistoryIcon'
};

walkDir(srcDir, (filePath) => {
  if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Fix imports: { ..., History, ... } -> { ..., History as HistoryIcon, ... }
    const importRegex = /import\s+\{([^}]+)\}\s+from\s+'lucide-react'/g;
    content = content.replace(importRegex, (match, p1) => {
      let icons = p1.split(',');
      let changed = false;
      icons = icons.map(icon => {
        let trimmedIcon = icon.trim();
        let iconName = trimmedIcon.split(' as ')[0].trim();
        if (problematicIcons[iconName] && !trimmedIcon.includes(' as ')) {
          changed = true;
          modified = true;
          return trimmedIcon.replace(iconName, `${iconName} as ${problematicIcons[iconName]}`);
        }
        return icon;
      });
      return changed ? `import { ${icons.join(',')} } from 'lucide-react'` : match;
    });

    // Fix usages: <History ... /> -> <HistoryIcon ... />
    // Also handle cloned elements if any: React.cloneElement(icon, ...) where icon is History
    if (modified) {
      for (const [oldName, newName] of Object.entries(problematicIcons)) {
        // Simple regex for <History ... /> or <History /> or {History} but skip if part of word
        const tagRegex = new RegExp(`<${oldName}(\\s|\\/|>)`, 'g');
        content = content.replace(tagRegex, (match, p1) => `<${newName}${p1}`);
        
        const closeTagRegex = new RegExp(`</${oldName}>`, 'g');
        content = content.replace(closeTagRegex, `</${newName}>`);

        // Handle usages in objects: icon: <History /> -> icon: <HistoryIcon />
        // Handled by tagRegex.
        
        // Handle variable names if any: value: History -> value: HistoryIcon
        // This is riskier so I'll be careful.
        // Actually, lucide icons are components, so they are mainly used in JSX.
      }
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`[FIXED] ${filePath}`);
    }
  }
});
