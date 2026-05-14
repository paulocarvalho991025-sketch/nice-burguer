// ============================
// TRADING.JS OTIMIZADO
// ============================

const TradingExecutorExtended = {
  get MEXC_KEY() {
    return obterMexcKeyDoCookie();
  },

  verificarMenorLiquidez(acao) {
    return appState.hasLowerLiquidity(acao);
  },

  // ============================
  // MEXC SPOT API
  // ============================
  async executarOrdemMexcAPISpot(acao, quantidade, config = {}) {
    try {
      console.log(`🚀 Executando MEXC SPOT: ${acao} - ${quantidade}`);

      const preco = this.obterPrecoInterface(acao, 'spot');
      if (!preco) throw new Error('Preço não disponível');

      await RateLimiter.updateLastRequest('mexc', 'spot');

      const params = {
        currencyId: appState?.data?.mexc?.Coin_id_spot_mexc,
        marketCurrencyId: "128f589271cb4951b03e71e6323eb7be",
        tradeType: acao === 'comprar' ? 'BUY' : 'SELL',
        price: preco.toString(),
        orderType: "MARKET_ORDER",
        quantity: quantidade,
        ts: Date.now()
      };

      const result = await this.fazerRequisicaoMexc(params, 'spot');
      
      if (result.code && result.code !== 200) {
        throw new Error(`MEXC (${result.code}): ${result.msg || 'Erro desconhecido'}`);
      }

      console.log(`✅ Ordem MEXC SPOT executada:`, result);
      this.mostrarToastSucesso(acao, quantidade);
      
      return result;
    } catch (error) {
      console.error(`❌ Erro MEXC SPOT:`, error);
      this.mostrarToastErro(error.message);
      throw error;
    }
  },

  // ============================
  // MEXC FUTURES API
  // ============================
  async executarOrdemMexcAPI(acao, quantidade, config) {
    try {
      console.log(`🚀 Executando MEXC FUTURES: ${acao} - ${quantidade}`);

      await RateLimiter.updateLastRequest('mexc', 'futures');

      const preco = this.obterPrecoInterface(acao, 'futures');
      if (!preco) throw new Error('Preço não disponível');

      const contractSize = appState?.data?.mexc?.cs_futures ?? 1;
      const volumeAjustado = (quantidade / contractSize).toFixed(4);

      const mexcParams = {
        symbol: appState.data.connection.token,
        side: acao === 'comprar' ? 3 : 2,
        vol: volumeAjustado,
        price: preco,
        type: 5,
        openType: 1,
        leverage: 1,
        orderType: 5
      };

      const orderResult = await MexcAPI.limit_order(this.MEXC_KEY, mexcParams);

      if (!orderResult?.success || orderResult.code !== 0) {
        throw new Error(orderResult?.message || `Code: ${orderResult?.code}`);
      }

      const orderId = orderResult.data;
      if (!orderId) throw new Error('ID da ordem não retornado');

      showToast(`✅ Ordem MEXC FUTURES criada! ID: ${orderId}`, 'success', 2000);
      return orderResult;
    } catch (error) {
      console.error(`❌ Erro MEXC FUTURES:`, error);
      showToast(`❌ Erro: ${error.message}`, 'error', 2000);
      throw error;
    }
  },

  // ============================
  // GATE SPOT API
  // ============================
  async executarOrdemGateAPI(acao, quantidade, config) {
    try {
      console.log(`🚀 Executando GATE SPOT: ${acao} - ${quantidade}`);

      await RateLimiter.updateLastRequest('gate', 'spot');

      const preco = this.obterPrecoInterface(acao, 'spot');
      if (!preco) throw new Error('Preço não disponível');

      const valorTotalCompra = quantidade * preco;
      const trade_amount = acao === 'comprar' ? valorTotalCompra.toFixed(2) : quantidade;

      const orderPayload = {
        type: "market",
        trade_type: "spot",
        currency_pair: appState.data.connection.token,
        trade_side: acao === 'comprar' ? 'buy' : 'sell',
        price: '0',
        trade_amount,
        iceberg: "0"
      };

      const response = await fetch('https://www.gate.com/apiw/v2/spot/orders', {
        method: 'POST',
        headers: this.getGateHeaders(),
        body: JSON.stringify(orderPayload),
        credentials: 'include'
      });

      const orderResult = await response.json();

      if (orderResult.code !== 200) {
        throw new Error(`Gate: ${orderResult.message}`);
      }

      const orderId = orderResult.data.order_id;
      console.log(`✅ Ordem GATE criada! ID: ${orderId}`);
      
      return orderResult;
    } catch (error) {
      console.error(`❌ Erro GATE:`, error);
      showToast(`❌ Erro: ${error.message}`, 'error', 5000);
      throw error;
    }
  },

  // ============================
  // ORDEM PRINCIPAL
  // ============================
  async executarOrdemCompleta(acao, quantidade, config, forcarExecucao = false) {
    try {
      if (appState.isTradingPending()) {
        console.log(`⛔ Ordem já pendente`);
        return false;
      }

      // ✅ VERIFICAÇÃO PRÉ-EXECUÇÃO
      if (!forcarExecucao) {
        const verificacao = await PreExecutionValidator.verificarExecucao(acao, quantidade);
        
        if (!verificacao.podeExecutar) {
          console.log(`⛔ Ordem bloqueada: ${verificacao.motivo}`);
          this.mostrarToastErro(verificacao.motivo);
          return false;
        }
      }

      const temMenorLiquidez = appState.hasLowerLiquidity(acao);
      if (!forcarExecucao && !temMenorLiquidez) {
        return false;
      }

      // ... resto do código permanece igual
      appState.setTradingOrder(acao, quantidade);
      atualizarInterfaceOrdemPendente(true);

      const executors = {
        'gate-spot': () => this.executarOrdemGateAPI(acao, quantidade, config),
        'mexc-futures': () => this.executarOrdemMexcAPI(acao, quantidade, config),
        'mexc-spot': () => this.executarOrdemMexcAPISpot(acao, quantidade, config)
      };

      const executorKey = `${config.corretora}-${config.tipo}`;
      const executor = executors[executorKey];

      if (executor) {
        await executor();
      } else {
        throw new Error(`Executor não encontrado: ${executorKey}`);
      }
      
      return true;
    } catch (error) {
      console.error(`❌ Erro na execução:`, error);
      limparEstadoOrdem();
      throw error;
    }
  },

  // ============================
  // HELPERS
  // ============================
  obterPrecoInterface(acao, tipo) {
    const elementIds = {
      'comprar-spot': 'valor-spot',
      'vender-spot': 'valor-spot-saida',
      'comprar-futures': 'valor-futures',
      'vender-futures': 'valor-futures-saida'
    };

    const elementId = elementIds[`${acao}-${tipo}`];
    const elemento = document.getElementById(elementId);
    
    if (elemento && elemento.textContent !== '0.000000') {
      const preco = parseFloat(elemento.textContent.replace(/[^\d.,]/g, ''));
      return isNaN(preco) ? null : preco;
    }
    
    return null;
  },

  async fazerRequisicaoMexc(params, tipo) {
    const cookies = {
      uc_token: this.MEXC_KEY,
      u_id: this.MEXC_KEY,
      CLIENT_LANG: "pt-PT"
    };

    const headers = {
      accept: "*/*",
      "content-type": "application/json",
      origin: "https://www.mexc.com",
      referer: "https://www.mexc.com/pt-PT/exchange/MX_USDT",
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      language: "pt-PT",
      "x-mxc-nonce": Date.now().toString()
    };

    const cookieString = Object.entries(cookies)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ');

    const url = tipo === 'spot' 
      ? "https://www.mexc.com/api/platform/spot/v4/order/place"
      : "https://www.mexc.com/api/platform/futures/order/place";

    const response = await fetch(url, {
      method: 'POST',
      headers: { ...headers, Cookie: cookieString },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    return response.json();
  },

// ============================
// CONTINUAÇÃO TRADING.JS OTIMIZADO
// ============================

  getGateHeaders() {
    return {
      accept: 'application/json, text/plain, */*',
      'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      'content-type': 'application/json',
      origin: 'https://www.gate.com',
      referer: `https://www.gate.com/pt-br/trade/${appState.data.connection.token}`,
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'x-gate-device-type': '0'
    };
  },

  mostrarToastSucesso(acao, quantidade) {
    if (typeof showToast === 'function') {
      const tokenName = appState?.data?.connection?.token?.replace('_USDT', '') || 'Token';
      const moeda = acao === 'comprar' ? 'USDT' : tokenName;
      showToast(`🎉 Ordem ${acao}: ${quantidade} ${moeda}`, 'success', 2000);
    }
  },

  mostrarToastErro(mensagem) {
    if (typeof showToast === 'function') {
      showToast(`❌ ${mensagem}`, 'error', 2000);
    }
  }
};

// ============================
// FUNÇÕES DE ESTADO
// ============================
function limparEstadoOrdem() {
  appState.clearTradingOrder();
  atualizarInterfaceOrdemPendente(false);
}

function atualizarInterfaceOrdemPendente(pendente) {
  const statusDiv = document.getElementById('trading-status');
  if (statusDiv) {
    if (pendente) {
      const currentOrder = appState.getTradingState();
      statusDiv.textContent = `⏳ Ordem ${currentOrder.orderType} pendente...`;
      statusDiv.style.color = '#facc15';
    } else {
      statusDiv.textContent = '';
    }
  }
}

// ============================
// TRADING COORDENADO
// ============================
function inicializarEventosConfiguracao() {
  setTimeout(() => {
    const elements = {
      toggleLiquidez: document.getElementById('toggle-config'),
      inputMoedas: document.getElementById('quantidade-input'),
      toggleAutotrade: document.getElementById('autotrade-toggle')
    };
    
    if (elements.toggleLiquidez && elements.inputMoedas) {
      elements.toggleLiquidez.addEventListener('change', () => {
        const ativo = elements.toggleLiquidez.checked;
        elements.inputMoedas.style.display = ativo ? 'block' : 'none';
        enviarConfiguracaoParaOutraAba('liquidez_toggle', ativo);
      });
      
      elements.inputMoedas.addEventListener('input', () => {
        enviarConfiguracaoParaOutraAba('liquidez_valor', elements.inputMoedas.value);
      });
    }
    
    if (elements.toggleAutotrade) {
      elements.toggleAutotrade.addEventListener('change', () => {
        enviarConfiguracaoParaOutraAba('autotrade_toggle', elements.toggleAutotrade.checked);
      });
    }
    
    console.log('⚙️ Eventos de configuração inicializados');
  }, 1000);
}

async function executarOrdemEspelho(acao, quantidade) {
  const config = TradingDetector.getConfig();
  if (!config) {
    console.warn('❌ Configuração não encontrada');
    return;
  }

  try {
    const resultado = await TradingExecutorExtended.executarOrdemCompleta(acao, quantidade, config, true);

    if (resultado && typeof onOrdemManualExecutada === 'function') {
      onOrdemManualExecutada(acao);
    }

    // Atualiza quantidade restante
    atualizarQuantidadeRestante(acao, quantidade);
    
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
      console.log(`✅ Ordem espelho (${acao}) executada`);
      limparEstadoOrdem();
    }

  } catch (error) {
    console.error(`❌ Erro ordem espelho:`, error);
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

function atualizarQuantidadeRestante(acao, quantidade) {
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
      console.log(`📦 Quantidade restante: ${restante}`);
      TradingInterface.inicializarConfiguracoes();
    });
  });
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
  console.log(`🚀 Comando ${acao}: ${quantidade} | Menor liquidez: ${temMenorLiquidez ? 'SIM' : 'NÃO'}`);
}

async function executarTradingRemoto(acao, quantidade, temMenorLiquidez) {
  console.log(`🎯 Trading remoto: ${acao} | Quantidade: ${quantidade} | Liquidez: ${temMenorLiquidez ? 'SIM' : 'NÃO'}`);

  if (!temMenorLiquidez) {
    console.log(`⏭️ Sem menor liquidez - não executando`);
    return;
  }

  const config = TradingDetector.getConfig();
  if (!config) {
    console.error('❌ Configuração não encontrada');
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

    await TradingExecutorExtended.executarOrdemCompleta(acao, quantidade, config);
    console.log(`✅ Trading remoto ${acao} executado`);

  } catch (error) {
    console.error(`❌ Erro trading remoto:`, error);
  }
}