// Script de debug - Cole no console do Chrome para testar
console.log('🔧 INICIANDO DEBUG DA EXTENSÃO...');

// Função para detectar token na URL
function getTokenFromURL() {
  const url = window.location.href;
  console.log('🌐 URL atual:', url);
  
  // Gate.io: https://www.gate.com/pt-br/trade/AIC_USDT
  if (url.includes('gate.com')) {
    const match = url.match(/\/trade\/([^\/\?]+)/);
    const token = match ? match[1] : null;
    console.log('🔍 Gate.io - Token detectado:', token);
    return token;
  }
  
  // MEXC: https://www.mexc.com/pt-PT/futures/AIC_USDT
  if (url.includes('mexc.com')) {
    const match = url.match(/\/futures\/([^\/\?]+)/);
    const token = match ? match[1] : null;
    console.log('🔍 MEXC - Token detectado:', token);
    return token;
  }
  
  console.log('❌ Site não suportado');
  return null;
}

// Função para detectar tipo de página
function detectarTipoPagina() {
  const url = window.location.href;
  
  if (url.includes('gate.com') && url.includes('/trade/')) {
    console.log('📊 Tipo detectado: SPOT (Gate.io)');
    return 'spot';
  }
  
  if (url.includes('mexc.com') && url.includes('/futures/')) {
    console.log('📈 Tipo detectado: FUTURES (MEXC)');
    return 'futures';
  }
  
  console.log('❌ Tipo não detectado');
  return null;
}

// Executar testes
console.log('='.repeat(50));
console.log('TESTE DE DETECÇÃO:');
console.log('='.repeat(50));

const token = getTokenFromURL();
const tipo = detectarTipoPagina();

console.log(`✅ Token: ${token || 'NÃO DETECTADO'}`);
console.log(`✅ Tipo: ${tipo || 'NÃO DETECTADO'}`);

// Verificar se a extensão deveria funcionar
if (token && tipo) {
  console.log('🟢 RESULTADO: Extensão DEVERIA funcionar nesta página!');
  
  // Verificar se popup já existe
  const popupExistente = document.getElementById('popup-fixo-extensao');
  if (popupExistente) {
    console.log('🟢 Popup já existe na página');
  } else {
    console.log('🔴 Popup NÃO encontrado na página');
  }
  
  // Verificar se service worker está ativo
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    console.log('🟢 API Chrome disponível');
    
    try {
      chrome.runtime.sendMessage({test: true}, (response) => {
        if (chrome.runtime.lastError) {
          console.log('🔴 Service Worker erro:', chrome.runtime.lastError.message);
        } else {
          console.log('🟢 Service Worker respondendo');
        }
      });
    } catch (e) {
      console.log('🔴 Erro ao testar service worker:', e);
    }
  } else {
    console.log('🔴 API Chrome NÃO disponível');
  }
  
} else {
  console.log('🔴 RESULTADO: Extensão NÃO deveria funcionar nesta página');
  
  if (!token) {
    console.log('❌ Problema: Token não detectado na URL');
    console.log('💡 Dica: Verifique se está em uma URL válida:');
    console.log('  - gate.com/pt-br/trade/SYMBOL_USDT');
    console.log('  - mexc.com/pt-PT/futures/SYMBOL_USDT');
  }
  
  if (!tipo) {
    console.log('❌ Problema: Tipo de página não detectado');
  }
}

console.log('='.repeat(50));
console.log('TESTE DE MANIFEST:');
console.log('='.repeat(50));

// Verificar se está nas URLs do manifest
const manifestUrls = [
  'https://www.gate.com/pt-br/trade/',
  'https://www.mexc.com/pt-PT/futures/'
];

const urlAtual = window.location.href;
const matchManifest = manifestUrls.some(url => urlAtual.startsWith(url));

if (matchManifest) {
  console.log('🟢 URL corresponde ao manifest.json');
} else {
  console.log('🔴 URL NÃO corresponde ao manifest.json');
  console.log('📝 URLs suportadas:', manifestUrls);
}

console.log('='.repeat(50));
console.log('TESTE COMPLETO FINALIZADO');
console.log('='.repeat(50));