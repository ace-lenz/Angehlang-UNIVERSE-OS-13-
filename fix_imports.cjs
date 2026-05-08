const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function fixImportsInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // regex for `import ... from '...'` and `export ... from '...'`
    const importRegex = /(import|export)\s+([\s\S]*?)\s+from\s+['"]([^'"]+)['"]/g;
    
    content = content.replace(importRegex, (match, type, imports, importPath) => {
        if (!importPath.startsWith('.')) {
            return match; // Ignore third-party and already aliased imports
        }
        
        // Resolve the absolute path of the imported file based on the CURRENT file's location
        const absoluteImportPath = path.resolve(path.dirname(filePath), importPath);
        
        // Check if the resolved path is inside the `src` directory
        const relativeToSrc = path.relative(srcDir, absoluteImportPath);
        
        if (!relativeToSrc.startsWith('..') && !path.isAbsolute(relativeToSrc)) {
            modified = true;
            const newAliasPath = '@/' + relativeToSrc.replace(/\\/g, '/');
            return `${type} ${imports} from '${newAliasPath}'`;
        }
        
        return match;
    });

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed imports in ${filePath}`);
    }
}

function processAll(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processAll(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            fixImportsInFile(fullPath);
        }
    }
}

processAll(srcDir);
console.log('Import fixing complete.');
