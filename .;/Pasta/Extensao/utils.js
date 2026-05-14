// ============================
// UTILS.JS OTIMIZADO
// ============================

function getTokenFromURL() {
  const path = location.pathname.split('/');
  return (path[path.length - 1] || '').toUpperCase();
}

let CONFIG_GLOBAL = { corretora: null, tipo: null };

function gerarIdentificadorComSpotPrimeiro() {
  const token = getTokenFromURL();
  const tipo = appState.data.connection.tipo;
  const config = TradingDetector.getConfig();
  const corretora = config.corretora;
  const corretoraGlobal = CONFIG_GLOBAL.corretora || 'none';
  const tipoGlobal = CONFIG_GLOBAL.tipo || 'none';

  const primeiraConfig = tipo === 'spot' ? `${corretora}-${tipo}` : 
    tipoGlobal === 'spot' ? `${corretoraGlobal}-${tipoGlobal}` : `${corretora}-${tipo}`;
  const segundaConfig = tipo === 'spot' ? `${corretoraGlobal}-${tipoGlobal}` : 
    tipoGlobal === 'spot' ? `${corretora}-${tipo}` : `${corretoraGlobal}-${tipoGlobal}`;
  
  return `${token}_${primeiraConfig}_${segundaConfig}`;
}

function conectarComPort(token, tipo, onMessageCallback) {
  const port = chrome.runtime.connect({ name: token });
  port.postMessage({ tipo });
  port.onMessage.addListener(onMessageCallback);
  return { enviar: (msg) => port.postMessage(msg) };
}

// ============================
// AUTOTRADE ULTRA COMPACTO
// ============================
const AutoTrade = {
  state: 'idle',
  lastCheck: 0,
  cooldownUntil: 0,
  interval: null,
  
  config: {
    checkInterval: 200,
    cooldownTime: 1000,
    rateLimitTime: 2000
  },

  async tick() {
    const now = Date.now();
    if (now - this.lastCheck < this.config.checkInterval || 
        now < this.cooldownUntil || 
        this.state !== 'idle') return;
    
    this.lastCheck = now;
    this.state = 'checking';
    
    try {
      const check = this.quickCheck();
      if (!check.valid) return;
      
      if (check.shouldExecute && await this.canExecuteAPI()) {
        await this.execute(check);
      }
    } finally {
      this.state = 'idle';
    }
  },

  quickCheck() {
    const autotrade = appState.getAutotradeState();
    const lucroEl = document.getElementById('lucro-entrada');
    const lucroSaidaEl = document.getElementById('lucro-saida');
    const qtyInput = document.getElementById('quantity-input');
    
    if (!autotrade.ativo || appState.isTradingPending() || 
        !lucroEl || !lucroSaidaEl || !qtyInput?.value ||
        lucroEl.textContent === 'N/A' || lucroSaidaEl.textContent === 'N/A') {
      return { valid: false };
    }
    
    const lucroEntrada = parseFloat(lucroEl.textContent.replace('%', ''));
    const lucroSaida = parseFloat(lucroSaidaEl.textContent.replace('%', ''));
    const quantidade = parseFloat(qtyInput.value);
    
    if (isNaN(lucroEntrada) || isNaN(lucroSaida) || quantidade <= 0) {
      return { valid: false };
    }
    
    const deveAbrir = lucroEntrada >= autotrade.percentualAbertura;
    const deveFecha = lucroSaida >= autotrade.percentualFechamento;
    
    return {
      valid: true,
      shouldExecute: deveAbrir || deveFecha,
      acao: deveAbrir ? 'comprar' : 'vender',
      quantidade,
      lucro: deveAbrir ? lucroEntrada : lucroSaida
    };
  },

  async canExecuteAPI() {
    const config = TradingDetector.getConfig();
    if (!config) return false;
    
    const canRequest = await RateLimiter.canMakeRequest(config.corretora, config.tipo);
    if (!canRequest) {
      this.cooldownUntil = Date.now() + this.config.rateLimitTime;
      return false;
    }
    return true;
  },

  // ✅ CÓDIGO NOVO:
  async execute(check) {
    this.state = 'executing';
    
    try {
      console.log(`🤖 AutoTrade: ${check.acao} ${check.quantidade} (${check.lucro}%)`);
      
      // ✅ NOVA VERIFICAÇÃO PRÉ-EXECUÇÃO
      const verificacao = await PreExecutionValidator.verificarExecucao(check.acao, check.quantidade);
      
      if (!verificacao.podeExecutar) {
        console.log(`⛔ AutoTrade bloqueado: ${verificacao.motivo}`);
        atualizarStatusAutotrade(`⛔ ${verificacao.motivo}`, '#ff4444');
        this.cooldownUntil = Date.now() + this.config.cooldownTime;
        return;
      }
      
      const temMenorLiquidez = appState.hasLowerLiquidity(check.acao);
      enviarComandoTrading(check.acao, check.quantidade, !temMenorLiquidez);
      
      if (temMenorLiquidez) {
        const config = TradingDetector.getConfig();
        if (config) {
          enviar({
            tipo: 'trading_mirror',
            origem: appState.data.connection.tipo,
            acao: check.acao,
            quantidade: check.quantidade,
            token: appState.data.connection.token,
            timestamp: Date.now()
          });
          
          await TradingExecutorExtended.executarOrdemCompleta(check.acao, check.quantidade, config);
        }
      }
      
      this.cooldownUntil = Date.now() + this.config.cooldownTime;
    } catch (error) {
      console.error('❌ AutoTrade erro:', error);
      this.cooldownUntil = Date.now() + this.config.cooldownTime * 2;
    }
  },

  start() {
    if (this.interval) this.stop();
    this.interval = setInterval(() => this.tick(), 50);
    console.log('🤖 AutoTrade iniciado');
  },

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.state = 'idle';
    console.log('🛑 AutoTrade parado');
  }
};

// ============================
// ADICIONE ESTE CÓDIGO NO FINAL DO UTILS.JS
// ============================

const PreExecutionValidator = {
  // Tolerância em pontos percentuais: -0.20%
  TOLERANCIA_PONTOS_PERCENTUAIS: 0.05, // 0.20 pontos percentuais
  
  _cache: { timestamp: 0, result: null, key: null },
  _cacheTime: 300,
  
  async verificarExecucao(acao, quantidade) {
    const now = Date.now();
    const cacheKey = `${acao}-${quantidade}`;
    
    if (this._cache.timestamp && 
        (now - this._cache.timestamp) < this._cacheTime && 
        this._cache.key === cacheKey) {
      return this._cache.result;
    }
    
    try {
      const verificacaoLucro = this.verificarLucro(acao);
      if (!verificacaoLucro.temLucro) {
        return this.criarResultado(false, verificacaoLucro.motivo);
      }
      
      const verificacaoQuantidade = await this.verificarQuantidades(acao, quantidade);
      if (!verificacaoQuantidade.podeExecutar) {
        return this.criarResultado(false, verificacaoQuantidade.motivo);
      }
      
      const verificacaoLiquidez = this.verificarLiquidez(acao, quantidade);
      if (!verificacaoLiquidez.suficiente) {
        return this.criarResultado(false, verificacaoLiquidez.motivo);
      }
      
      const resultado = this.criarResultado(true, 'Ordem pode ser executada');
      this._cache = { timestamp: now, key: cacheKey, result: resultado };
      return resultado;
      
    } catch (error) {
      return this.criarResultado(false, `Erro: ${error.message}`);
    }
  },
  
  /**
   * Verifica lucro com tolerância em pontos percentuais
   * Exemplo: se lucro configurado é 1.0% e tolerância é 0.20
   * Margem mínima = 1.0% - 0.20% = 0.80%
   */
  verificarLucro(acao) {
    const lucroEntradaEl = document.getElementById('lucro-entrada');
    const lucroSaidaEl = document.getElementById('lucro-saida');
    
    if (!lucroEntradaEl || !lucroSaidaEl) {
      return { temLucro: false, motivo: 'Elementos de lucro não encontrados' };
    }
    
    // Pega o lucro atual da interface
    const lucroTexto = acao === 'comprar' ? lucroEntradaEl.textContent : lucroSaidaEl.textContent;
    
    if (lucroTexto === 'N/A' || lucroTexto === 'SEM LIQUIDEZ') {
      return { temLucro: false, motivo: 'Lucro não disponível' };
    }
    
    const lucroAtual = parseFloat(lucroTexto.replace('%', ''));
    
    if (isNaN(lucroAtual)) {
      return { temLucro: false, motivo: 'Lucro inválido' };
    }
    
    // ✅ PEGA O LUCRO CONFIGURADO PELO USUÁRIO
    const lucroConfigurado = this.obterLucroConfigurado(acao);
    
    if (lucroConfigurado === null) {
      return { temLucro: false, motivo: 'Lucro não configurado no AutoTrade' };
    }
    
    // ✅ CALCULA A MARGEM MÍNIMA: lucroConfigurado - 0.20 pontos percentuais
    const margemMinima = lucroConfigurado - this.TOLERANCIA_PONTOS_PERCENTUAIS;
    
    if (lucroAtual < margemMinima) {
      return { 
        temLucro: false, 
        motivo: `Lucro insuficiente: ${lucroAtual}% < ${margemMinima.toFixed(2)}% (${lucroConfigurado}% - ${this.TOLERANCIA_PONTOS_PERCENTUAIS}%)`,
        lucroAtual,
        lucroConfigurado,
        margemMinima,
        tolerancia: this.TOLERANCIA_PONTOS_PERCENTUAIS
      };
    }
    
    return { 
      temLucro: true, 
      motivo: `Lucro OK: ${lucroAtual}% >= ${margemMinima.toFixed(2)}%`,
      lucroAtual,
      lucroConfigurado,
      margemMinima,
      tolerancia: this.TOLERANCIA_PONTOS_PERCENTUAIS
    };
  },
  
  /**
   * Obtém o lucro configurado pelo usuário no AutoTrade
   */
  obterLucroConfigurado(acao) {
    const autotradeData = appState.getAutotradeState();
    
    if (!autotradeData.ativo) {
      return null; // AutoTrade não está ativo
    }
    
    if (acao === 'comprar') {
      return autotradeData.percentualAbertura;
    } else if (acao === 'vender') {
      return autotradeData.percentualFechamento;
    }
    
    return null;
  },
  
  async verificarQuantidades(acao, quantidade) {
    try {
      const identificador = gerarIdentificadorComSpotPrimeiro();
      const chaveTotal = `quantidadeMoedas_${identificador}`;
      const chaveRestante = `quantidadeMoedasRestante_${identificador}`;
      
      const dados = await new Promise((resolve) => {
        chrome.storage.local.get([chaveTotal, chaveRestante], resolve);
      });
      
      const quantidadeMaxima = parseFloat(dados[chaveTotal] || 0);
      const quantidadeRestante = parseFloat(dados[chaveRestante] ?? quantidadeMaxima);
      const quantidadeJaComprada = quantidadeMaxima - quantidadeRestante;
      
      if (quantidadeMaxima <= 0) {
        return {
          podeExecutar: false,
          motivo: 'Configure a quantidade máxima primeiro'
        };
      }
      
      if (acao === 'comprar') {
        if (quantidadeRestante < quantidade) {
          return {
            podeExecutar: false,
            motivo: `Saldo insuficiente: ${quantidadeRestante} < ${quantidade}`
          };
        }
      } else if (acao === 'vender') {
        if (quantidadeJaComprada <= 0) {
          return {
            podeExecutar: false,
            motivo: 'Nenhuma posição para vender'
          };
        }
        if (quantidadeJaComprada < quantidade) {
          return {
            podeExecutar: false,
            motivo: `Posição insuficiente: ${quantidadeJaComprada} < ${quantidade}`
          };
        }
      }
      
      return { podeExecutar: true, motivo: 'Quantidade OK' };
      
    } catch (error) {
      return {
        podeExecutar: false,
        motivo: `Erro ao verificar quantidades: ${error.message}`
      };
    }
  },
  
  verificarLiquidez(acao, quantidade) {
    try {
      const precos = calcularPrecosComLiquidez();
      if (!precos) {
        return { suficiente: false, motivo: 'Preços não disponíveis' };
      }
      
      if (acao === 'comprar') {
        const { compraSpot, vendaFutures } = precos.entrada;
        if (compraSpot.insuficiente || vendaFutures.insuficiente) {
          return { suficiente: false, motivo: 'Liquidez insuficiente para abertura' };
        }
      } else if (acao === 'vender') {
        const { vendaSpot, compraFutures } = precos.saida;
        if (vendaSpot.insuficiente || compraFutures.insuficiente) {
          return { suficiente: false, motivo: 'Liquidez insuficiente para fechamento' };
        }
      }
      
      return { suficiente: true, motivo: 'Liquidez OK' };
      
    } catch (error) {
      return { suficiente: false, motivo: `Erro liquidez: ${error.message}` };
    }
  },
  
  criarResultado(podeExecutar, motivo) {
    return { podeExecutar, motivo, timestamp: Date.now() };
  }
};

// ============================
// UTILS ESSENCIAIS
// ============================
const CalcUtils = {
  parsePreco: (precoTexto) => {
    if (!precoTexto || typeof precoTexto !== 'string') return NaN;
    
    let preco = precoTexto.trim().replace(/,/g, '').replace(/[\u200E\u200F\u202A\u202B\u202C\u202D\u202E\u2066\u2067\u2068\u2069]/g, '');
    
    const regexCientifica = /^0\.0\{(\d+)\}(\d+)$/;
    const match = preco.match(regexCientifica);
    
    if (match) {
      const zeros = parseInt(match[1]);
      const numeros = match[2];
      return parseFloat('0.' + '0'.repeat(zeros) + numeros);
    }
    
    return parseFloat(preco);
  },

  parseValor: (valorTexto) => {
    if (!valorTexto || typeof valorTexto !== 'string') return NaN;
    
    let valor = valorTexto.trim().replace(/,/g, '').replace(/[\u200E\u200F\u202A\u202B\u202C\u202D\u202E\u2066\u2067\u2068\u2069]/g, '');
    
    if (valor.includes('k') || valor.includes('K')) return parseFloat(valor.replace(/[kK]/g, '')) * 1000;
    if (valor.includes('M')) return parseFloat(valor.replace(/M/g, '')) * 1000000;
    if (valor.includes('B')) return parseFloat(valor.replace(/B/g, '')) * 1000000000;
    
    return parseFloat(valor);
  }
};

const ObserverUtils = {
  ativos: [],
  
  criar(elemento, callback, debounceMs = 50) {
    let timeoutId;
    const observer = new MutationObserver(() => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(callback, debounceMs);
    });
    
    observer.observe(elemento, { 
      childList: true, 
      subtree: true, 
      characterData: true 
    });
    
    this.ativos.push(observer);
    return observer;
  },
  
  pararTodos() {
    this.ativos.forEach(obs => obs?.disconnect?.());
    this.ativos.length = 0;
  },
  
  inicializarComRetry(selector, callback, maxTentativas = 10) {
    let tentativas = 0;
    
    const tentar = () => {
      const elementos = document.querySelectorAll(selector);
      if (elementos.length) {
        callback(elementos);
        return true;
      }
      
      tentativas++;
      if (tentativas < maxTentativas) {
        setTimeout(tentar, 500);
      }
      return false;
    };
    
    return tentar();
  }
};

// ============================
// EXTRACTORS E CONFIGURAÇÕES
// ============================
const EXTRACTORS = {
  mexcFuturesBook: (containerDiv) => {
    if (!containerDiv?.children?.[0]?.children) return null;
    
    const ordensCompletas = [];
    const linhasOrdens = containerDiv.children[0].children;
    
    for (let i = 0; i < linhasOrdens.length; i++) {
      const linha = linhasOrdens[i];
      if (!linha.children || linha.children.length < 4) continue;
      
      const spanPreco = linha.children[0]?.querySelector('span');
      const segundaDiv = linha.children[1];
      
      if (!spanPreco?.textContent || !segundaDiv?.textContent) continue;
      
      const precoTexto = spanPreco.textContent.trim();
      const quantidadeTexto = segundaDiv.textContent.trim();
      const precoNum = CalcUtils.parsePreco(precoTexto);
      const quantidadeNum = CalcUtils.parseValor(quantidadeTexto);
      
      if (isNaN(precoNum) || isNaN(quantidadeNum) || precoNum <= 0 || quantidadeNum <= 0) continue;
      
      ordensCompletas.push({
        preco: precoTexto,
        qtd: quantidadeTexto,
        valor: (precoNum * quantidadeNum).toFixed(2),
        precoNum,
        quantidadeNum,
        valorNum: precoNum * quantidadeNum
      });
    }
    
    return ordensCompletas.length > 0 ? ordensCompletas : null;
  },

  gateSpotBook: (containerDiv) => {
    if (!containerDiv?.children) return null;
    
    const ordensCompletas = [];
    
    for (let i = 0; i < containerDiv.children.length; i++) {
      const linha = containerDiv.children[i];
      if (!linha.children || linha.children.length < 2) continue;
      
      const precoDiv = linha.children[0];
      const quantidadeDiv = linha.children[1];
      
      if (!precoDiv?.textContent || !quantidadeDiv?.textContent) continue;
      
      const precoTexto = precoDiv.textContent.trim();
      const precoNum = CalcUtils.parsePreco(precoTexto);
      
      let quantidadeTexto = '';
      for (let node of quantidadeDiv.childNodes) {
        if (node.nodeType === Node.TEXT_NODE) {
          quantidadeTexto += node.textContent;
        }
      }
      
      if (!quantidadeTexto.trim()) {
        quantidadeTexto = quantidadeDiv.textContent.trim();
      }
      
      const quantidadeNum = CalcUtils.parseValor(quantidadeTexto.trim());
      
      if (isNaN(precoNum) || isNaN(quantidadeNum) || precoNum <= 0 || quantidadeNum <= 0) continue;
      
      ordensCompletas.push({
        preco: precoTexto,
        qtd: quantidadeTexto.trim(),
        valor: (precoNum * quantidadeNum).toFixed(2),
        precoNum,
        quantidadeNum,
        valorNum: precoNum * quantidadeNum
      });
    }
    
    return ordensCompletas.length > 0 ? ordensCompletas : null;
  },

  mexcSpotBook: (containerDiv) => {
    if (!containerDiv?.children?.[0]?.children) return null;
    
    const ordensCompletas = [];
    const linhasOrdens = containerDiv.children[0].children;
    
    for (let i = 0; i < linhasOrdens.length; i++) {
      const linha = linhasOrdens[i];
      if (!linha.children?.[0]?.children || linha.children[0].children.length < 4) continue;
      
      const divInterna = linha.children[0];
      const segundaDiv = divInterna.children[1];
      const terceiraDiv = divInterna.children[2];
      
      if (!segundaDiv?.textContent) continue;
      
      const spanQuantidade = terceiraDiv?.querySelector('span');
      if (!spanQuantidade?.textContent && !terceiraDiv?.textContent) continue;
      
      const precoTexto = segundaDiv.textContent.trim().split(' ')[0];
      const quantidadeTexto = (spanQuantidade ? spanQuantidade.textContent.trim() : terceiraDiv.textContent.trim()).split(' ')[0];
      
      const precoNum = CalcUtils.parsePreco(precoTexto);
      const quantidadeNum = CalcUtils.parseValor(quantidadeTexto);
      const quantidadeNumSemCentavos = Math.floor(quantidadeNum);
      
      if (isNaN(precoNum) || isNaN(quantidadeNumSemCentavos) || precoNum <= 0 || quantidadeNumSemCentavos <= 0) continue;
      
      // Formata quantidade
      const formatarQuantidade = (valor) => {
        const num = Math.floor(valor);
        if (num < 1000) return num.toString();
        if (num < 1000000) return (num / 1000).toFixed(3).replace(/\.?0+$/, '') + 'k';
        if (num < 1000000000) return (num / 1000000).toFixed(3).replace(/\.?0+$/, '') + 'M';
        return (num / 1000000000).toFixed(3).replace(/\.?0+$/, '') + 'B';
      };
      
      ordensCompletas.push({
        preco: precoTexto,
        qtd: formatarQuantidade(quantidadeNumSemCentavos),
        valor: (precoNum * quantidadeNumSemCentavos).toFixed(2),
        precoNum,
        quantidadeNum: quantidadeNumSemCentavos,
        valorNum: precoNum * quantidadeNumSemCentavos
      });
    }
    
    return ordensCompletas.length > 0 ? ordensCompletas : null;
  }
};

const OBSERVACOES_CONFIG = {
  futures: [
    { nome: 'BID-MEXC-Book', selector: 'div.market_bidsWrapper__lt6yB', tipoPagina: 'futures', tipoPreco: 'bid', extrairDados: EXTRACTORS.mexcFuturesBook, isBookComplete: true },
    { nome: 'ASK-MEXC-Book', selector: 'div.market_asksWrapper__JH8bn', tipoPagina: 'futures', tipoPreco: 'ask', extrairDados: EXTRACTORS.mexcFuturesBook, isBookComplete: true }
  ],
  spot: [
    { nome: 'ASK-Gate-Book', selector: 'div[type="asks"].sc-278b8b11-1.euMbSg', tipoPagina: 'spot', tipoPreco: 'ask', extrairDados: EXTRACTORS.gateSpotBook, isBookComplete: true },
    { nome: 'BID-Gate-Book', selector: 'div[type="bids"].sc-278b8b11-1.kxoqcJ', tipoPagina: 'spot', tipoPreco: 'bid', extrairDados: EXTRACTORS.gateSpotBook, isBookComplete: true },
    { nome: 'ASK-MEXC-Spot-Book', selector: 'div.orderbook_asks__tLvbM', tipoPagina: 'spot', tipoPreco: 'ask', extrairDados: EXTRACTORS.mexcSpotBook, isBookComplete: true },
    { nome: 'BID-MEXC-Spot-Book', selector: 'div.orderbook_bids__swekw', tipoPagina: 'spot', tipoPreco: 'bid', extrairDados: EXTRACTORS.mexcSpotBook, isBookComplete: true }
  ]
};

const TradingDetector = {
  detectarCorretora() {
    const url = location.href.toLowerCase();
    if (url.includes('gate.io') || url.includes('gate.com')) return 'gate';
    if (url.includes('mexc.com')) return 'mexc';
    return null;
  },
  
  detectarTipo() {
    const url = location.href.toLowerCase();
    if (url.includes('/futures/') || url.includes('/future/')) return 'futures';
    return 'spot';
  },
  
  getConfig() {
    return {
      corretora: this.detectarCorretora(),
      tipo: this.detectarTipo()
    };
  }
};

// ============================
// FUNÇÕES ESSENCIAIS
// ============================
function inicializarAutotrade() {
  console.log('🤖 Inicializando AutoTrade...');
  configurarEventosAutotrade();
}

function configurarEventosAutotrade() {
  setTimeout(() => {
    const autotradeToggle = document.getElementById('autotrade-toggle');
    const aberturaInput = document.getElementById('autotrade-abertura');
    const fechamentoInput = document.getElementById('autotrade-fechamento');
    
    if (autotradeToggle) {
      autotradeToggle.addEventListener('change', () => {
        const ativo = autotradeToggle.checked;
        appState.setAutotradeActive(ativo);
        
        if (ativo) {
          atualizarStatusAutotrade('🤖 AutoTrade ATIVO', '#00c851');
          AutoTrade.start();
        } else {
          atualizarStatusAutotrade('', '');
          AutoTrade.stop();
        }
        
        enviarConfiguracaoParaOutraAba('autotrade_toggle', ativo);
      });
    }
    
    if (aberturaInput) {
      aberturaInput.addEventListener('input', () => {
        const abertura = parseFloat(aberturaInput.value);
        const fechamento = parseFloat(fechamentoInput?.value);
        appState.setAutotradePercentages(abertura, fechamento);
        enviarConfiguracaoParaOutraAba('autotrade_abertura', abertura);
      });
    }

    if (fechamentoInput) {
      fechamentoInput.addEventListener('input', () => {
        const fechamento = parseFloat(fechamentoInput.value);
        const abertura = parseFloat(aberturaInput?.value);
        appState.setAutotradePercentages(abertura, fechamento);
        enviarConfiguracaoParaOutraAba('autotrade_fechamento', fechamento);
      });
    }

    const quantityInput = document.getElementById('quantity-input');
    if (quantityInput) {
      quantityInput.addEventListener('input', () => {
        atualizarLucrosComLiquidez();
      });
    }
  }, 1000);
}

async function verificarQuantidadeRestanteExtensao() {
  try {
    const identificador = gerarIdentificadorComSpotPrimeiro();
    const chaveTotal = `quantidadeMoedas_${identificador}`;
    const chaveRestante = `quantidadeMoedasRestante_${identificador}`;

    const dados = await new Promise((resolve) => {
      chrome.storage.local.get([chaveTotal, chaveRestante], resolve);
    });

    if (dados[chaveRestante] !== undefined && dados[chaveRestante] !== null) {
      return parseFloat(dados[chaveRestante]) || 0;
    }

    if (dados[chaveTotal] !== undefined && dados[chaveTotal] !== null) {
      const total = parseFloat(dados[chaveTotal]) || 0;
      await new Promise((resolve) => {
        chrome.storage.local.set({ [chaveRestante]: total }, resolve);
      });
      return total;
    }

    return 0;
  } catch (error) {
    console.error('❌ Erro ao verificar quantidade:', error);
    return 0;
  }
}

function atualizarStatusAutotrade(texto, cor) {
  const statusDiv = document.getElementById('trading-status');
  if (statusDiv) {
    statusDiv.textContent = texto;
    statusDiv.style.color = cor;
  }
  if (texto) console.log(`🤖 AutoTrade Status: ${texto}`);
}

function integrarAutotradeComSistema() {
  if (appState.data.connection.tipo !== 'spot') {
    console.log('🚫 AutoTrade só funciona na página SPOT');
    return;
  }
  
  setTimeout(() => {
    inicializarAutotrade();
    AutoTrade.start();
  }, 1500);
}

function onOrdemManualExecutada(acao) {
  const autotradeData = appState.getAutotradeState();
  if (autotradeData.ativo) {
    if (acao === 'comprar') {
      atualizarStatusAutotrade('✅ Posição ABERTA (manual)', '#00c851');
    } else if (acao === 'vender') {
      atualizarStatusAutotrade('✅ Posição FECHADA (manual)', '#00c851');
    }
  }
}

// ============================
// CÁLCULOS E LIQUIDEZ
// ============================
function encontrarMelhorPrecoComLiquidez(tipo, side, quantidadeDesejada, objetivo = 'menor') {
  const book = appState.getBookData(tipo, side);
  
  if (!book || book.length === 0) {
    return { 
      preco: null, 
      precoMedio: null,
      liquidezDisponivel: 0, 
      insuficiente: true,
      tipo,
      side,
      detalhesExecucao: []
    };
  }

  let quantidadeRestante = quantidadeDesejada;
  let valorTotalGasto = 0;
  let quantidadeTotalUsada = 0;
  const detalhesExecucao = [];
  
  const bookOrdenado = [...book].sort((a, b) => 
    objetivo === 'menor' ? a.precoNum - b.precoNum : b.precoNum - a.precoNum
  );

  for (const ordem of bookOrdenado) {
    if (quantidadeRestante <= 0) break;
    
    const quantidadeUsada = Math.min(quantidadeRestante, ordem.quantidadeNum);
    const valorGasto = quantidadeUsada * ordem.precoNum;
    
    valorTotalGasto += valorGasto;
    quantidadeTotalUsada += quantidadeUsada;
    quantidadeRestante -= quantidadeUsada;
    
    detalhesExecucao.push({
      preco: ordem.precoNum,
      quantidadeDisponivel: ordem.quantidadeNum,
      quantidadeUsada,
      valorGasto
    });
  }

  if (quantidadeRestante > 0) {
    return {
      preco: null,
      precoMedio: null,
      liquidezDisponivel: quantidadeTotalUsada,
      insuficiente: true,
      tipo,
      side,
      detalhesExecucao
    };
  }

  const precoMedioReal = valorTotalGasto / quantidadeTotalUsada;

  return {
    preco: precoMedioReal,
    precoMedio: precoMedioReal,
    precoUltimaOrdem: detalhesExecucao[detalhesExecucao.length - 1]?.preco,
    valorTotalGasto,
    liquidezDisponivel: quantidadeTotalUsada,
    suficiente: true,
    tipo,
    side,
    detalhesExecucao
  };
}

function calcularPrecosComLiquidez() {
  const quantidadeInput = document.getElementById('quantity-input');
  if (!quantidadeInput?.value) return null;

  const quantidade = parseFloat(quantidadeInput.value);
  if (isNaN(quantidade) || quantidade <= 0) return null;

  return {
    quantidade,
    timestamp: Date.now(),
    entrada: {
      compraSpot: encontrarMelhorPrecoComLiquidez('spot', 'ask', quantidade, 'menor'),
      vendaFutures: encontrarMelhorPrecoComLiquidez('futures', 'bid', quantidade, 'maior')
    },
    saida: {
      vendaSpot: encontrarMelhorPrecoComLiquidez('spot', 'bid', quantidade, 'maior'),
      compraFutures: encontrarMelhorPrecoComLiquidez('futures', 'ask', quantidade, 'menor')
    }
  };
}

function calcularLucrosComLiquidez() {
  const precos = calcularPrecosComLiquidez();
  if (!precos) return { entrada: 'N/A', saida: 'N/A' };
  
  const { entrada, saida } = precos;
  
  let lucroEntrada = 'SEM LIQUIDEZ';
  let precoCompraSpot = null;
  let precoVendaFutures = null;
  
  if (!entrada.compraSpot.insuficiente && !entrada.vendaFutures.insuficiente) {
    lucroEntrada = ((entrada.vendaFutures.preco - entrada.compraSpot.preco) / entrada.compraSpot.preco * 100).toFixed(3) + '%';
    precoCompraSpot = entrada.compraSpot.preco;
    precoVendaFutures = entrada.vendaFutures.preco;
  }
  
  let lucroSaida = 'SEM LIQUIDEZ';
  let precoVendaSpot = null;
  let precoCompraFutures = null;
  
  if (!saida.vendaSpot.insuficiente && !saida.compraFutures.insuficiente) {
    lucroSaida = ((saida.vendaSpot.preco - saida.compraFutures.preco) / saida.compraFutures.preco * 100).toFixed(3) + '%';
    precoVendaSpot = saida.vendaSpot.preco;
    precoCompraFutures = saida.compraFutures.preco;
  }
  
  return {
    entrada: lucroEntrada,
    saida: lucroSaida,
    precoCompraSpot,
    precoVendaFutures,
    precoVendaSpot,
    precoCompraFutures,
    detalhes: precos
  };
}

function detectarTipoPagina() {
  const url = location.href;
  if (url.includes('/futures/') || url.includes('/future/')) return 'futures';
  if (url.includes('/spot/') || url.includes('/trade/')) return 'spot';
  return 'spot'; // padrão
}

function atualizarLucrosComLiquidez() {
  const lucros = calcularLucrosComLiquidez();
  
  const lucroEntradaEl = document.getElementById('lucro-entrada');
  const lucroSaidaEl = document.getElementById('lucro-saida');
  
  if (lucroEntradaEl) {
    lucroEntradaEl.textContent = lucros.entrada;
    lucroEntradaEl.style.color = getCorLucro(lucros.entrada);
  }
  
  if (lucroSaidaEl) {
    lucroSaidaEl.textContent = lucros.saida;
    lucroSaidaEl.style.color = getCorLucro(lucros.saida);
  }

  // Atualiza preços na interface
  const valorSpotEl = document.getElementById('valor-spot');
  const valorFuturesEl = document.getElementById('valor-futures');
  const valorSpotSaidaEl = document.getElementById('valor-spot-saida');
  const valorFuturesSaidaEl = document.getElementById('valor-futures-saida');
  
  if (valorSpotEl) {
    valorSpotEl.textContent = lucros.precoCompraSpot ? lucros.precoCompraSpot.toFixed(6) : 'N/A';
  }
  if (valorFuturesEl) {
    valorFuturesEl.textContent = lucros.precoVendaFutures ? lucros.precoVendaFutures.toFixed(6) : 'N/A';
  }
  if (valorSpotSaidaEl) {
    valorSpotSaidaEl.textContent = lucros.precoVendaSpot ? lucros.precoVendaSpot.toFixed(6) : 'N/A';
  }
  if (valorFuturesSaidaEl) {
    valorFuturesSaidaEl.textContent = lucros.precoCompraFutures ? lucros.precoCompraFutures.toFixed(6) : 'N/A';
  }
}

function getCorLucro(valor) {
  if (valor === 'N/A' || valor === 'SEM LIQUIDEZ') return '#666';
  if (typeof valor === 'string' && valor.includes('%')) {
    const numerico = parseFloat(valor.replace('%', ''));
    return numerico >= 0 ? '#00c851' : '#ff4444';
  }
  return '#666';
}

// ============================
// LIQUIDEZ MANAGER COMPACTO
// ============================
const LiquidezManager = {
  calcularLiquidezEntrada() {
    const { spot, futures } = appState.getLiquidity();
    if (spot.entrada === 0 || futures.entrada === 0) {
      return Math.max(spot.entrada, futures.entrada);
    }
    return Math.min(spot.entrada, futures.entrada);
  },
  
  calcularLiquidezSaida() {
    const { spot, futures } = appState.getLiquidity();
    if (spot.saida === 0 || futures.saida === 0) {
      return Math.max(spot.saida, futures.saida);
    }
    return Math.min(spot.saida, futures.saida);
  },
  
  formatarValor(valor) {
    if (valor === 0 || !valor) return 'N/A';
    if (valor >= 1000000) return '$' + (valor / 1000000).toFixed(1) + 'M';
    if (valor >= 1000) return '$' + (valor / 1000).toFixed(1) + 'K';
    return '$' + valor.toFixed(0);
  },
  
  atualizarDisplay() {
    const liquidezEntradaEl = document.getElementById('liquidez-entrada');
    const liquidezSaidaEl = document.getElementById('liquidez-saida');
    
    if (!liquidezEntradaEl || !liquidezSaidaEl) return;
    
    const liquidezEntrada = this.calcularLiquidezEntrada();
    const liquidezSaida = this.calcularLiquidezSaida();
    
    liquidezEntradaEl.textContent = `Liquidez: ${this.formatarValor(liquidezEntrada)}`;
    liquidezEntradaEl.style.color = this.getCorLiquidez(liquidezEntrada);
    
    liquidezSaidaEl.textContent = `Liquidez: ${this.formatarValor(liquidezSaida)}`;
    liquidezSaidaEl.style.color = this.getCorLiquidez(liquidezSaida);
  },
  
  getCorLiquidez(valor) {
    if (valor === 0) return '#666';
    if (valor < 1000) return '#ff4444';
    if (valor < 10000) return '#facc15';
    return '#00c851';
  },

  atualizarSpot(entrada, saida) {
    appState.updateLiquidity('spot', entrada, saida);
    this.atualizarDisplay();
  },
  
  atualizarFutures(entrada, saida) {
    appState.updateLiquidity('futures', entrada, saida);
    this.atualizarDisplay();
  }
};

// ============================
// SISTEMA DE INICIALIZAÇÃO COMPACTO
// ============================
const initTradingSystem = () => {
  const checkPopup = setInterval(() => {
    const popup = document.getElementById('popup-fixo-extensao');
    if (popup) {
      clearInterval(checkPopup);
      setTimeout(() => {
        TradingInterface.inicializarConfiguracoes();
        const config = TradingDetector.getConfig();
        if (config) {
          console.log(`🎯 Trading configurado: ${config.corretora}/${config.tipo}`);
        }
      }, 500);
    }
  }, 100);
  
  setTimeout(() => clearInterval(checkPopup), 10000);
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTradingSystem);
} else {
  initTradingSystem();
}