const fs = require('fs');
const path = require('path');

const MAP = {
  // Backgrounds
  'bg-slate-950': 'bg-slate-50 dark:bg-slate-950',
  'bg-slate-900': 'bg-white dark:bg-slate-900',
  'bg-slate-800': 'bg-slate-100 dark:bg-slate-800',
  'bg-slate-700': 'bg-slate-200 dark:bg-slate-700',
  
  // Texts
  'text-slate-100': 'text-slate-900 dark:text-slate-100',
  'text-slate-200': 'text-slate-800 dark:text-slate-200',
  'text-slate-300': 'text-slate-700 dark:text-slate-300',
  'text-slate-400': 'text-slate-600 dark:text-slate-400',
  
  // Borders
  'border-slate-900': 'border-slate-200 dark:border-slate-900',
  'border-slate-800': 'border-slate-200 dark:border-slate-800',
  'border-slate-700': 'border-slate-300 dark:border-slate-700',
  
  // Hovers
  'hover:bg-slate-800': 'hover:bg-slate-200 dark:hover:bg-slate-800',
  'hover:bg-slate-700': 'hover:bg-slate-300 dark:hover:bg-slate-700',
  
  // Divide
  'divide-slate-800': 'divide-slate-200 dark:divide-slate-800',
  'divide-slate-700': 'divide-slate-300 dark:divide-slate-700',
};

function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDir(fullPath));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = walkDir('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  for (const [key, value] of Object.entries(MAP)) {
    const regex = new RegExp(`(?<!dark:|[\\\\w-])${key}(?![\\\\w-])`, 'g');
    if (regex.test(content)) {
      content = content.replace(regex, value);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated', file);
  }
});
