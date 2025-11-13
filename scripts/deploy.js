#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, '..', 'dist');
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Función para desplegar forzando inclusión de todos los archivos
function deployToGhPages() {
  log('\n🚀 Iniciando deploy a GitHub Pages...\n', 'blue');
  
  try {
    const rootDir = path.join(__dirname, '..');
    
    // Verificar que dist existe
    if (!fs.existsSync(DIST_DIR)) {
      log('❌ Error: La carpeta dist/ no existe. Ejecuta npm run build primero.', 'red');
      process.exit(1);
    }
    
    log('📦 Preparando archivos para deploy...', 'yellow');
    
    // Crear un directorio temporal sin .gitignore para forzar inclusión
    const tempDir = path.join(rootDir, '.gh-pages-temp');
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    fs.mkdirSync(tempDir, { recursive: true });
    
    // Función para copiar directorios recursivamente
    function copyRecursiveSync(src, dest) {
      const exists = fs.existsSync(src);
      const stats = exists && fs.statSync(src);
      const isDirectory = exists && stats.isDirectory();
      
      if (isDirectory) {
        fs.mkdirSync(dest, { recursive: true });
        fs.readdirSync(src).forEach(childItemName => {
          // Saltar .git y otros directorios ocultos del sistema
          if (childItemName === '.git' || childItemName === 'node_modules') {
            return;
          }
          copyRecursiveSync(
            path.join(src, childItemName),
            path.join(dest, childItemName)
          );
        });
      } else {
        fs.copyFileSync(src, dest);
      }
    }
    
    // Copiar el contenido de dist al directorio temporal (no el directorio dist mismo)
    // Incluyendo archivos ocultos (como .nojekyll)
    log('📋 Copiando archivos de dist/...', 'blue');
    function copyDistContents(srcDir, destDir) {
      // Leer todos los archivos incluyendo ocultos
      const items = fs.readdirSync(srcDir, { withFileTypes: true });
      items.forEach(item => {
        const srcPath = path.join(srcDir, item.name);
        const destPath = path.join(destDir, item.name);
        if (item.isDirectory()) {
          copyRecursiveSync(srcPath, destPath);
        } else {
          fs.copyFileSync(srcPath, destPath);
        }
      });
    }
    copyDistContents(DIST_DIR, tempDir);
    
    log('📤 Subiendo archivos a gh-pages...', 'yellow');
    
    // Usar gh-pages con todas las opciones necesarias desde el directorio temporal
    // --dotfiles: incluye archivos que empiezan con punto (.nojekyll, etc.)
    // --no-history: no mantiene historial completo (más rápido y limpio)
    execSync(
      `npx gh-pages -d "${tempDir}" --dotfiles --no-history`,
      {
        stdio: 'inherit',
        cwd: rootDir,
      }
    );
    
    // Limpiar directorio temporal
    log('🧹 Limpiando archivos temporales...', 'blue');
    fs.rmSync(tempDir, { recursive: true, force: true });
    
    log('\n✅ Deploy completado exitosamente!', 'green');
    log('🌐 Tu sitio debería estar disponible en unos minutos en GitHub Pages', 'blue');
    
  } catch (error) {
    log('\n❌ Error durante el deploy:', 'red');
    console.error(error.message);
    process.exit(1);
  }
}

deployToGhPages();

