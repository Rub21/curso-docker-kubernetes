#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, '..', 'dist');
const SOURCE_DIR = path.join(__dirname, '..');

// Colores para la consola
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

// Limpiar y crear directorio dist
function cleanDist() {
  log('🧹 Limpiando directorio dist...', 'yellow');
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(DIST_DIR, { recursive: true });
}

// Encontrar todos los archivos slides.md
function findSlidesFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Ignorar node_modules, dist, .git
      if (!['node_modules', 'dist', '.git', 'scripts'].includes(file)) {
        findSlidesFiles(filePath, fileList);
      }
    } else if (file === 'slides.md') {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Compilar slides a HTML usando marp-cli
function compileSlides(slidesFiles) {
  log(`\n📦 Compilando ${slidesFiles.length} archivos de slides...`, 'blue');
  
  slidesFiles.forEach((slideFile, index) => {
    const relativePath = path.relative(SOURCE_DIR, slideFile);
    const outputPath = path.join(DIST_DIR, relativePath.replace('.md', '.html'));
    const outputDir = path.dirname(outputPath);
    
    // Crear directorio de salida si no existe
    fs.mkdirSync(outputDir, { recursive: true });
    
      try {
        // Compilar con marp-cli usando formato HTML
        // --html genera HTML con secciones <section> que podemos parsear
        execSync(`npx @marp-team/marp-cli "${slideFile}" -o "${outputPath}" --html`, {
          stdio: 'inherit',
          cwd: SOURCE_DIR
        });
      
      log(`  ✓ ${relativePath}`, 'green');
    } catch (error) {
      log(`  ✗ Error compilando ${relativePath}`, 'red');
      console.error(error.message);
    }
  });
}

// Copiar archivos HTML estáticos
function copyStaticFiles() {
  log('\n📋 Copiando archivos estáticos...', 'blue');
  
  const staticFiles = [
    'index.html',
    'docker.html',
    'index-kubernetes.html',
    'viewer.html',
    'notes.html'
  ];
  
  staticFiles.forEach(file => {
    const sourcePath = path.join(SOURCE_DIR, file);
    const destPath = path.join(DIST_DIR, file);
    
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, destPath);
      log(`  ✓ ${file}`, 'green');
    } else {
      log(`  ⚠ ${file} no encontrado`, 'yellow');
    }
  });
}

// Copiar directorios necesarios (imágenes, etc.)
function copyDirectories() {
  log('\n📁 Copiando directorios necesarios...', 'blue');
  
  // Copiar imágenes de módulos si existen
  const dockerDir = path.join(SOURCE_DIR, 'docker');
  const kubernetesDir = path.join(SOURCE_DIR, 'kubernetes');
  
  function copyModuleAssets(dir, baseName) {
    if (fs.existsSync(dir)) {
      const modules = fs.readdirSync(dir);
      modules.forEach(module => {
        const modulePath = path.join(dir, module);
        if (fs.statSync(modulePath).isDirectory()) {
          const imagesPath = path.join(modulePath, 'images');
          if (fs.existsSync(imagesPath)) {
            const destImagesPath = path.join(DIST_DIR, baseName, module, 'images');
            fs.mkdirSync(destImagesPath, { recursive: true });
            copyRecursiveSync(imagesPath, destImagesPath);
            log(`  ✓ ${baseName}/${module}/images`, 'green');
          }
        }
      });
    }
  }
  
  copyModuleAssets(dockerDir, 'docker');
  copyModuleAssets(kubernetesDir, 'kubernetes');
}

// Función auxiliar para copiar directorios recursivamente
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  
  if (isDirectory) {
    fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Generar índice de todos los módulos compilados
function generateIndex() {
  log('\n📝 Generando índice de módulos...', 'blue');
  
  const modules = {
    docker: [],
    kubernetes: []
  };
  
  // Buscar todos los HTML compilados
  function findHtmlFiles(dir, basePath = '') {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        findHtmlFiles(filePath, path.join(basePath, file));
      } else if (file === 'slides.html') {
        const relativePath = path.join(basePath, file);
        if (basePath.startsWith('docker')) {
          modules.docker.push(relativePath);
        } else if (basePath.startsWith('kubernetes')) {
          modules.kubernetes.push(relativePath);
        }
      }
    });
  }
  
  if (fs.existsSync(DIST_DIR)) {
    findHtmlFiles(DIST_DIR);
  }
  
  const indexContent = `# Módulos Compilados

## Docker
${modules.docker.map(m => `- [${m}](${m})`).join('\n')}

## Kubernetes
${modules.kubernetes.map(m => `- [${m}](${m})`).join('\n')}
`;
  
  fs.writeFileSync(path.join(DIST_DIR, 'MODULES.md'), indexContent);
  log('  ✓ MODULES.md generado', 'green');
}

// Función principal
function main() {
  log('\n🚀 Iniciando build...\n', 'blue');
  
  try {
    // 1. Limpiar dist
    cleanDist();
    
    // 2. Encontrar todos los slides.md
    const slidesFiles = findSlidesFiles(SOURCE_DIR);
    log(`\n📚 Encontrados ${slidesFiles.length} archivos de slides`, 'green');
    
    // 3. Compilar slides a HTML
    compileSlides(slidesFiles);
    
    // 4. Copiar archivos estáticos
    copyStaticFiles();
    
    // 5. Copiar directorios necesarios
    copyDirectories();
    
    // 6. Generar índice
    generateIndex();
    
    // 7. Crear archivo .nojekyll para GitHub Pages
    const nojekyllPath = path.join(DIST_DIR, '.nojekyll');
    fs.writeFileSync(nojekyllPath, '');
    log('  ✓ .nojekyll creado', 'green');
    
    log('\n✅ Build completado exitosamente!', 'green');
    log(`\n📦 Los archivos compilados están en: ${DIST_DIR}`, 'blue');
    log('\n💡 Para servir el build:', 'yellow');
    log('   cd dist && npx http-server -p 8000 -o', 'yellow');
    log('   o sube la carpeta dist/ a tu servidor web\n', 'yellow');
    
  } catch (error) {
    log('\n❌ Error durante el build:', 'red');
    console.error(error);
    process.exit(1);
  }
}

// Ejecutar
main();

