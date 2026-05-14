// ============================
// CONTENT.JS OTIMIZADO
// ============================
appState.setConnection(false, getTokenFromURL(), detectarTipoPagina());

const token = appState.data.connection.token;
const tipo = appState.data.connection.tipo;
const config = TradingDetector.getConfig();

// ============================
// CONFIGURAÇÃO INICIAL MEXC
// ============================
if (config.corretora === 'mexc') {
  if (tipo === 'futures') {
    fetch(`https://futures.mexc.com/api/v1/contract/detailV2?client=web&symbol=${token}`)
      .then(res => res.json())
      .then(res => {
        if (res.success && res.data?.[0]?.cs) {
          if (!appState.data.mexc) appState.data.mexc = {};
          appState.data.mexc.cs_futures = res.data[0].cs;
        }
      })
      .catch(err => console.error('❌ Erro MEXC Futures:', err));
  }
  
  if (tipo === 'spot') {
    const currency = token.replace('_USDT', '');
    fetch('https://www.mexc.com/api/platform/spot/market-v2/web/symbolsV2')
      .then(res => res.json())
      .then(res => {
        const coinData = res?.data?.symbols?.USDT?.find(item => item.vn === currency);
        if (coinData?.cd) {
          if (!appState.data.mexc) appState.data.mexc = {};
          appState.data.mexc.Coin_id_spot_mexc = coinData.cd;
          console.log(`✅ CoinId MEXC Spot: ${coinData.cd}`);
        }
      })
      .catch(err => console.error('❌ Erro MEXC Spot:', err));
  }
}

// ============================
// CONEXÃO E MESSAGEHANDLER
// ============================
let messageHandler, handleMessageFunc;

const { enviar } = conectarComPort(token, tipo, (msg) => {
  if (handleMessageFunc) {
    handleMessageFunc(msg);
  }
});

messageHandler = createMessageHandler(appState, enviar);
handleMessageFunc = replaceHandleMessage(messageHandler);

// ============================
// OBSERVERS OTIMIZADOS
// ============================
function iniciarObservers() {
  console.log('🚀 Iniciando observers...');
  OBSERVACOES_CONFIG[appState.data.connection.tipo]?.forEach(observarPrecos);
}

function observarPrecos(config) {
  const { selector, tipoPagina, tipoPreco, isBookComplete = false } = config;
  let containerAtual = null;
  
  function processar() {
    const elementos = document.querySelectorAll(selector);
    if (!elementos.length) return;
    
    const container = elementos[0];
    if (container === containerAtual) return;
    
    containerAtual = container;
    
    if (isBookComplete) {
      iniciarObserverBookCompleto(container);
    }
  }
  
  function iniciarObserverBookCompleto(container) {
    let extrator;
    
    if (tipoPagina === 'futures') {
      extrator = EXTRACTORS.mexcFuturesBook;
    } else if (tipoPagina === 'spot') {
      extrator = config.selector.includes('orderbook_') 
        ? EXTRACTORS.mexcSpotBook 
        : EXTRACTORS.gateSpotBook;
    } else {
      return;
    }

    const dados = extrator(container);
    if (dados?.length > 0) {
      atualizarDadosBook(dados);
    }
    
    ObserverUtils.criar(container, () => {
      const novosDados = extrator(container);
      if (novosDados?.length > 0 && dadosBookAlteraram(novosDados, tipoPagina, tipoPreco)) {
        atualizarDadosBook(novosDados);
      }
    });
  }
  
  function atualizarDadosBook(ordensArray) {
    const currentType = appState.data.connection.tipo;
    
    appState.updateBookData(currentType, tipoPreco, ordensArray);
    
    const liquidezTotal = ordensArray.reduce((total, ordem) => total + ordem.valorNum, 0);
    atualizarLiquidezLocal(tipoPreco, liquidezTotal);
    
    const melhorOrdem = ordensArray[0];
    if (melhorOrdem) {
      const currentMarket = appState.getMarketData(currentType) || { bid: null, ask: null };
      currentMarket[tipoPreco] = {
        preco: melhorOrdem.preco,
        qtd: melhorOrdem.qtd,
        valor: melhorOrdem.valor
      };
      appState.updateMarketData(currentType, currentMarket);
    }
    
    atualizarInterface();
    
    if (appState.hasValidMarketData(currentType)) {
      const marketData = appState.getMarketData(currentType);
      const bookCompleto = {};
      const askData = appState.getBookData(currentType, 'ask');
      const bidData = appState.getBookData(currentType, 'bid');
      
      if (askData?.length > 0) bookCompleto.ask = askData;
      if (bidData?.length > 0) bookCompleto.bid = bidData;
      
      enviar({
        tipo: currentType,
        origem: currentType,
        bid: marketData.bid, 
        ask: marketData.ask,
        book: bookCompleto,
        token: appState.data.connection.token,
        timestamp: Date.now()
      });
      
      enviarLiquidez();
    }
  }
  
  ObserverUtils.criar(document.body, processar, 100);
  ObserverUtils.inicializarComRetry(selector, processar);
}

function dadosBookAlteraram(novasOrdens, tipoPagina, tipoPreco) {
  const bookAtual = appState.getBookData ? appState.getBookData(tipoPagina, tipoPreco) : null;
  
  if (!bookAtual || bookAtual.length !== novasOrdens.length) return true;
  
  for (let i = 0; i < Math.min(3, novasOrdens.length); i++) {
    const nova = novasOrdens[i];
    const atual = bookAtual[i];
    
    if (!atual || nova.preco !== atual.preco || nova.qtd !== atual.qtd) {
      return true;
    }
  }
  
  return false;
}

// ============================
// FUNÇÕES DE LIQUIDEZ
// ============================
function atualizarLiquidezLocal(tipoPreco, valorDolar) {
  const currentType = appState.data.connection.tipo;
  
  if (tipoPreco === 'ask') {
    appState.updateLiquidity(currentType, valorDolar, null);
  } else if (tipoPreco === 'bid') {
    appState.updateLiquidity(currentType, null, valorDolar);
  }
  
  if (typeof LiquidezManager !== 'undefined') {
    const updatedLiquidity = appState.getLiquidity(currentType);
    if (currentType === 'spot') {
      LiquidezManager.atualizarSpot(updatedLiquidity.entrada, updatedLiquidity.saida);
    } else if (currentType === 'futures') {
      LiquidezManager.atualizarFutures(updatedLiquidity.entrada, updatedLiquidity.saida);
    }
  }
}

function enviarLiquidez() {
  const currentType = appState.data.connection.tipo;
  const currentLiquidity = appState.getLiquidity(currentType);
  
  enviar({
    tipo: 'liquidez',
    origem: currentType,
    liquidez: {
      entrada: currentLiquidity.entrada,
      saida: currentLiquidity.saida
    },
    token: appState.data.connection.token,
    timestamp: Date.now()
  });
}

// ============================
// CONFIGURAÇÕES E SYNC
// ============================
function enviarConfiguracaoParaOutraAba(tipoConfig, valor) {
  enviar({
    tipo: 'config_sync',
    origem: appState.data.connection.tipo,
    config: { tipo: tipoConfig, valor },
    token: appState.data.connection.token,
    timestamp: Date.now()
  });
}

function atualizarVisualToggle(tipo, ativo) {
  let sliderBg, sliderBall;
  
  if (tipo === 'liquidez') {
    sliderBg = document.querySelector('.liquidez-slider-bg');
    sliderBall = document.querySelector('.liquidez-slider-ball');
  } else if (tipo === 'autotrade') {
    sliderBg = document.querySelector('.autotrade-slider-bg');
    sliderBall = document.querySelector('.autotrade-slider-ball');
  }
  
  if (sliderBg && sliderBall) {
    if (ativo) {
      sliderBg.style.backgroundColor = '#00c851';
      sliderBall.style.transform = 'translateX(16px)';
    } else {
      sliderBg.style.backgroundColor = '#444';
      sliderBall.style.transform = 'translateX(0px)';
    }
  }
}

// ============================
// FUNÇÕES DE TRADING
// ============================
async function executarOrdemEspelho(acao, quantidade) {
  const config = TradingDetector.getConfig();
  if (!config) {
    console.warn('❌ Configuração não encontrada para ordem espelho');
    return;
  }

  try {
    const resultado = await TradingExecutorExtended.executarOrdemCompleta(acao, quantidade, config, true);

    if (resultado && typeof onOrdemManualExecutada === 'function') {
      onOrdemManualExecutada(acao);
    }

    const identificador = gerarIdentificadorComSpotPrimeiro();
    const chaveTotal = `quantidadeMoedas_${identificador}`;
    const chaveRestante = `quantidadeMoedasRestante_${identificador}`;

    chrome.storage.local.get([chaveTotal, chaveRestante], (dados) => {
      let total = parseFloat(dados[chaveTotal] || 0);
      let restante = parseFloat(dados[chaveRestante] ?? total);
      const qtd = parseFloat(quantidade);

      if (acao === 'comprar') {
        restante = Math.max(0, restante - qtd);
      } else if (acao === 'vender') {
        restante = restante + qtd;
      }

      chrome.storage.local.set({ [chaveRestante]: restante }, () => {
        console.log(`📦 ${chaveRestante} atualizada: ${restante}`);
      });

      TradingInterface.inicializarConfiguracoes();
    });
    
    enviar({
      tipo: 'espelho_resultado',
      origem: appState.data.connection.tipo,
      acao,
      resultado,
      quantidade,
      token: appState.data.connection.token,
      timestamp: Date.now()
    });

    if (resultado) {
      console.log(`✅ Ordem espelho (${acao}) executada com sucesso`);
      limparEstadoOrdem();
    }

  } catch (error) {
    console.error(`❌ Falha ao executar ordem espelho:`, error);
    enviar({
      tipo: 'espelho_resultado',
      origem: appState.data.connection.tipo,
      acao,
      resultado: false,
      erro: error.message,
      token: appState.data.connection.token,
      timestamp: Date.now()
    });
  }
}

function enviarComandoTrading(acao, quantidade, temMenorLiquidez) {
  enviar({
    tipo: 'trading_command',
    origem: appState.data.connection.tipo,
    acao,
    quantidade,
    temMenorLiquidez,
    token: appState.data.connection.token,
    timestamp: Date.now()
  });
  console.log(`🚀 Enviando comando ${acao} - Quantidade: ${quantidade}, Menor liquidez: ${temMenorLiquidez ? 'SIM' : 'NÃO'}`);
}

async function executarTradingRemoto(acao, quantidade, temMenorLiquidez) {
  console.log(`🎯 Trading remoto: ${acao}, Quantidade: ${quantidade}, Menor liquidez: ${temMenorLiquidez ? 'SIM' : 'NÃO'}`);

  if (!temMenorLiquidez) {
    console.log(`⏭️ Esta aba NÃO tem menor liquidez. Não executando.`);
    return;
  }

  const config = TradingDetector.getConfig();
  if (!config) {
    console.error('❌ Configuração de trading não encontrada');
    return;
  }

  try {
    enviar({
      tipo: 'trading_mirror',
      origem: appState.data.connection.tipo,
      acao,
      quantidade,
      token: appState.data.connection.token,
      timestamp: Date.now()
    });

    TradingExecutorExtended.executarOrdemCompleta(acao, quantidade, config);
    console.log(`✅ Trading remoto ${acao} executado com sucesso!`);

  } catch (error) {
    console.error(`❌ Erro no trading remoto ${acao}:`, error);
  }
}

// ============================
// UTILITÁRIOS E DEBUG
// ============================
function getAutotradeStatus() {
  const autotrade = appState.getAutotradeState();
  return {
    ativo: autotrade.ativo,
    percentualAbertura: autotrade.percentualAbertura,
    percentualFechamento: autotrade.percentualFechamento,
    posicaoAberta: autotrade.posicaoAberta,
    monitorando: !!autotrade.monitoringInterval
  };
}

function toggleAutotrade(ativo = null) {
  const toggle = document.getElementById('autotrade-toggle');
  if (toggle) {
    if (ativo !== null) {
      toggle.checked = ativo;
    } else {
      toggle.checked = !toggle.checked;
    }
    toggle.dispatchEvent(new Event('change'));
    return toggle.checked;
  }
  return false;
}

// ============================
// INICIALIZAÇÃO E PING
// ============================
setTimeout(() => enviar({ tipo: 'acao', acao: 'ping', valor: Date.now() }), 3000);

console.log(`🚀 Sistema iniciado | Tipo: ${tipo} | Token: ${token}`);
showToast('Sistema iniciado...', 'info', 2000);