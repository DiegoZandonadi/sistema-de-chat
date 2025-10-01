const { execSync } = require('child_process');
const path = require('path');

console.log('🔨 Iniciando build para Vercel...');

try {
  // Instalar dependências do cliente
  console.log('📦 Instalando dependências do cliente...');
  execSync('npm install', { cwd: path.join(__dirname, 'client'), stdio: 'inherit' });
  
  // Build do cliente
  console.log('🏗️ Fazendo build do cliente...');
  execSync('npm run build', { cwd: path.join(__dirname, 'client'), stdio: 'inherit' });
  
  console.log('✅ Build concluído com sucesso!');
} catch (error) {
  console.error('❌ Erro no build:', error.message);
  process.exit(1);
}
