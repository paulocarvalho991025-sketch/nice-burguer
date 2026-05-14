// BACKGROUND.JS

const conexoes = {};

chrome.runtime.onConnect.addListener((port) => {
  const token = port.name;
  let tipo;
  let corretora;
  
  // Detecta o tipo e corretora baseado na URL do sender
  if (port.sender.url.includes('gate.com')) {
    tipo = 'spot';
    corretora = 'gate';
  } else if (port.sender.url.includes('mexc.com') && port.sender.url.includes('/futures/')) {
    tipo = 'futures';
    corretora = 'mexc';
  } else if (port.sender.url.includes('mexc.com') && !port.sender.url.includes('/futures/')) {
    tipo = 'spot';
    corretora = 'mexc';
  } else {
    console.warn(`❌ URL não reconhecida: ${port.sender.url}`);
    return;
  }
  
  if (!conexoes[token]) conexoes[token] = {};
  
  // Armazenar porta com informações
  conexoes[token][tipo] = {
    port: port,
    corretora: corretora,
    tipo: tipo
  };

  console.log(`🔌 Conexão estabelecida: ${token} - ${corretora}-${tipo}`);

  // Verifica se ambas as conexões existem (spot + futures)
  if (conexoes[token].spot && conexoes[token].futures) {
    // Enviar para spot com informações do futures
    conexoes[token].spot.port.postMessage({ 
      tipo: 'system', 
      status: 'connected',
      outraAba: {
        corretora: conexoes[token].futures.corretora,
        tipo: conexoes[token].futures.tipo
      }
    });
    
    // Enviar para futures com informações do spot
    conexoes[token].futures.port.postMessage({ 
      tipo: 'system', 
      status: 'connected',
      outraAba: {
        corretora: conexoes[token].spot.corretora,
        tipo: conexoes[token].spot.tipo
      }
    });
  }

  port.onDisconnect.addListener(() => {
    console.log(`🔌 Desconectando: ${token} - ${corretora}-${tipo}`);
    delete conexoes[token][tipo];
    
    // Notificar a outra aba sobre a desconexão
    if (conexoes[token].spot) {
      conexoes[token].spot.port.postMessage({ 
        tipo: 'system', 
        status: 'disconnected' 
      });
    }
    if (conexoes[token].futures) {
      conexoes[token].futures.port.postMessage({ 
        tipo: 'system', 
        status: 'disconnected' 
      });
    }
  });

  port.onMessage.addListener((msg) => {
    const destino = tipo === 'spot' ? 'futures' : 'spot';
    const alvo = conexoes[token]?.[destino];
    if (alvo) {
      alvo.port.postMessage(msg);
    }
  });
});