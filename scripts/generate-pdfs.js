const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Crear carpeta pdf si no existe
const pdfDir = path.join(__dirname, '..', 'pdf');
if (!fs.existsSync(pdfDir)) {
  fs.mkdirSync(pdfDir, { recursive: true });
}

// Encontrar todos los módulos con slides.md
const modulesDir = path.join(__dirname, '..');
const allItems = fs.readdirSync(modulesDir)
  .filter(item => {
    const itemPath = path.join(modulesDir, item);
    return fs.statSync(itemPath).isDirectory() && 
           fs.existsSync(path.join(itemPath, 'slides.md'));
  });

// Ordenar: intro primero, luego requisitos, luego módulos numéricos
const modules = allItems.sort((a, b) => {
  if (a === 'intro') return -1;
  if (b === 'intro') return 1;
  if (a === 'requisitos') return -1;
  if (b === 'requisitos') return 1;
  return a.localeCompare(b);
});

console.log(`[ INFO ] Encontrados ${modules.length} módulos con slides.md`);
console.log(`[ INFO ] Generando PDFs en carpeta: pdf/`);

// Procesar cada módulo
modules.forEach((module, index) => {
  const slidesPath = path.join(modulesDir, module, 'slides.md');
  const pdfName = `${module}.pdf`;
  const pdfPath = path.join(pdfDir, pdfName);
  
  try {
    console.log(`[ ${index + 1}/${modules.length} ] Procesando ${module}...`);
    execSync(`npx marp "${slidesPath}" --pdf -o "${pdfPath}"`, {
      stdio: 'inherit',
      cwd: modulesDir
    });
    console.log(`[ ✓ ] ${pdfName} generado exitosamente\n`);
  } catch (error) {
    console.error(`[ ✗ ] Error al generar ${pdfName}:`, error.message);
  }
});

console.log(`[ INFO ] Todos los PDFs generados en: pdf/`);

