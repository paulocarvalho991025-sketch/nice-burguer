// ============================
// MESSAGEHANDLER.JS - VERSÃO CORRIGIDA
// ============================

/**
 * Sistema modular para gerenciar todas as mensagens entre abas
 * Substitui a função handleMessage() gigante por handlers específicos
 */

// ============================
// MESSAGEHANDLER PRINCIPAL
// ============================

class MessageHandler {
  constructor(appState, enviarCallback) {
    this.appState = appState;
    this.enviar = enviarCallback;
    
    // Cria instâncias dos handlers específicos
    this.systemHandler = new SystemHandler(appState, enviarCallback);
    this.dataHandler = new DataHandler(appState, enviarCallback);
    this.tradingHandler = new TradingHandler(appState, enviarCallback);
    this.liquidityHandler = new LiquidityHandler(appState, enviarCallback);
    this.configHandler = new ConfigHandler(appState, enviarCallback);
    this.syncHandler = new SyncHandler(appState, enviarCallback);
    this.toastHandler = new ToastHandler(appState, enviarCallback);

    console.log('✅ MessageHandler inicializado com todos os handlers');
  }

  /**
   * Processa uma mensagem roteando para o handler apropriado
   */
  handle(message) {
    try {
      const handlerType = this.getHandlerType(message.tipo);
      
      if (!handlerType) {
        console.warn(`⚠️ Tipo de mensagem desconhecido: ${message.tipo}`, message);
        return;
      }
      
      // Roteamento para handlers específicos
      switch (handlerType) {
        case 'system':
          this.systemHandler.handle(message);
          break;
          
        case 'data':
          this.dataHandler.handle(message);
          break;
          
        case 'trading':
          this.tradingHandler.handle(message);
          break;
          
        case 'liquidity':
          this.liquidityHandler.handle(message);
          break;
          
        case 'config':
          this.configHandler.handle(message);
          break;
          
        case 'sync':
          this.syncHandler.handle(message);
          break;
          
        default:
          console.warn(`⚠️ Handler não encontrado para tipo: ${handlerType}`);
      }
      
    } catch (error) {
      console.error(`❌ Erro no MessageHandler:`, error, message);
    }
  }

  /**
   * Mapeia tipos de mensagem para handlers
   */
  getHandlerType(messageType) {
    // Mapeamento direto
    const directMapping = {
      'system': 'system',
      'spot': 'data',
      'futures': 'data',
      'liquidez': 'liquidity',
      'trading_mirror': 'trading',
      'trading_command': 'trading',
      'config_sync': 'config',
      'espelho_resultado': 'trading',
      'acao': 'system',  // ✅ ADICIONADO: ping e outras ações do sistema
      'ping': 'system',   // ✅ ADICIONADO: fallback para ping direto
      'toast_show': 'toast',
      'toast_dismiss_all': 'toast'
    };
    
    // Verifica mapeamento direto primeiro
    if (directMapping[messageType]) {
      return directMapping[messageType];
    }
    
    // Verifica padrões especiais
    if (messageType.startsWith('atualizar')) {
      return 'sync';
    }
    
    return null;
  }
}

// ============================
// SYSTEMHANDLER - CONEXÃO/DESCONEXÃO/AÇÕES
// ============================

class SystemHandler {
  constructor(appState, enviarCallback) {
    this.appState = appState;
    this.enviar = enviarCallback;
  }

  handle(message) {
    const { tipo, acao, status, valor } = message;
    
    // ✅ NOVO: Trata diferentes tipos de mensagens do sistema
    if (tipo === 'acao') {
      this.handleAction(message);
    } else if (tipo === 'system' || status) {
      this.handleSystemStatus(message);
    } else {
      console.log(`🔌 SystemHandler: Mensagem genérica`, message);
    }
  }

  // ✅ NOVO: Processa ações específicas (ping, etc.)
  handleAction(message) {
    const { acao, valor } = message;
    
    switch (acao) {
      case 'ping':
        console.log(`🏓 Ping recebido: ${valor}`);
        // Responde com pong se necessário
        if (this.enviar && typeof this.enviar === 'function') {
          this.enviar({ 
            tipo: 'acao', 
            acao: 'pong', 
            valor: Date.now(),
            originalPing: valor 
          });
        }
        break;
        
      case 'pong':
        const latency = Date.now() - valor;
        console.log(`🏓 Pong recebido - Latência: ${latency}ms`);
        break;

      case 'toast':
        this.toastHandler.handle(message);
        break;
        
      default:
        console.log(`🔧 Ação do sistema: ${acao}`, message);
    }
  }

  // Processa status de conexão
  handleSystemStatus(message) {
    const { status, outraAba } = message;
    
    console.log(`🔌 SystemHandler: ${status}`);
    
    // Atualiza estado de conexão
    this.appState.setConnection(status === 'connected');

    // ✅ NOVO: Se recebeu informações da outra aba, atualizar CONFIG_GLOBAL
    if (outraAba && typeof CONFIG_GLOBAL !== 'undefined') {
      CONFIG_GLOBAL.corretora = outraAba.corretora;
      CONFIG_GLOBAL.tipo = outraAba.tipo;
      
      console.log(`🌐 CONFIG_GLOBAL atualizado via system:`, CONFIG_GLOBAL);
    
    } else if (status === 'disconnected' && typeof CONFIG_GLOBAL !== 'undefined') {
      // Limpar CONFIG_GLOBAL quando desconectar
      CONFIG_GLOBAL.corretora = null;
      CONFIG_GLOBAL.tipo = null;
      
      console.log(`🌐 CONFIG_GLOBAL limpo - outra aba desconectada`);
    }
    
    // Atualiza interface de status
    if (typeof atualizarStatusConexao === 'function') {
      atualizarStatusConexao(status);
    }
    
    // Controla observers baseado na conexão
    if (this.appState.conectado) {
      this.iniciarObservers();
    } else {
      this.pararObservers();
    }
  }

  iniciarObservers() {
    if (typeof ObserverUtils !== 'undefined') {
      ObserverUtils.inicializarComRetry('body', () => {
        if (typeof iniciarObservers === 'function') {
          iniciarObservers();
        }
      });
    }
  }

  pararObservers() {
    if (typeof ObserverUtils !== 'undefined') {
      ObserverUtils.pararTodos();
    }
  }
}

// ============================
// DATAHANDLER - DADOS DE MERCADO
// ============================

class DataHandler {
  constructor(appState, enviarCallback) {
    this.appState = appState;
    this.enviar = enviarCallback;
  }

  handle(message) {
    const { tipo: msgTipo, origem, bid, ask, book } = message;
    
    // Só processa mensagens de outras abas
    if (origem === this.appState.data.connection.tipo) {
      return;
    }
    
    // Valida dados essenciais
    if (!bid || !ask) {
      console.warn('⚠️ DataHandler: Dados de mercado incompletos', message);
      return;
    }
    
    // console.log('📊 DataHandler: Recebendo dados ', message);
    
    // Atualiza dados no AppState
    if (msgTipo === 'spot' || msgTipo === 'futures') {
      this.appState.updateMarketData(origem, { bid, ask });
    }
    
    if (book) {      
      if (book.ask && book.ask.length > 0) {
        this.appState.updateBookData(origem, 'ask', book.ask);
      }
      if (book.bid && book.bid.length > 0) {
        this.appState.updateBookData(origem, 'bid', book.bid);
      }
      
      if (typeof atualizarLucrosComLiquidez === 'function') {
        atualizarLucrosComLiquidez();
      }
    }
  }
}

// ============================
// TRADINGHANDLER - COMANDOS DE TRADING
// ============================

class TradingHandler {
  constructor(appState, enviarCallback) {
    this.appState = appState;
    this.enviar = enviarCallback;
  }

  handle(message) {
    const { tipo: msgTipo, origem } = message;
    
    // Só processa mensagens de outras abas
    if (origem === this.appState.data.connection.tipo) {
      return;
    }
    
    console.log(`🎯 TradingHandler: Processando ${msgTipo} de ${origem}`);
    
    switch (msgTipo) {
      case 'trading_mirror':
        this.handleTradingMirror(message);
        break;
        
      case 'trading_command':
        this.handleTradingCommand(message);
        break;
        
      case 'espelho_resultado':
        this.handleEspelhoResultado(message);
        break;
        
      default:
        console.warn(`⚠️ TradingHandler: Tipo desconhecido: ${msgTipo}`);
    }
  }

  handleTradingMirror(message) {
    const { acao, quantidade } = message;
    console.log(`🔄 Executando ordem espelho: ${acao} - Quantidade: ${quantidade}`);
    
    if (typeof executarOrdemEspelho === 'function') {
      executarOrdemEspelho(acao, quantidade);
    } else {
      console.warn('⚠️ Função executarOrdemEspelho não encontrada');
    }
  }

  handleTradingCommand(message) {
    const { acao, quantidade, temMenorLiquidez } = message;
    console.log(`🎯 Recebendo comando de trading:`, { acao, quantidade, temMenorLiquidez });
    
    if (typeof executarTradingRemoto === 'function') {
      executarTradingRemoto(acao, quantidade, temMenorLiquidez);
    } else {
      console.warn('⚠️ Função executarTradingRemoto não encontrada');
    }
  }

handleEspelhoResultado(message) {
  const { acao, resultado, erro } = message;
  console.log(`📋 Resultado da ordem espelho: ${acao} - Sucesso: ${resultado}`);

  if (resultado === true) {
    limparEstadoOrdem(); // ✅ Limpa somente se a ordem foi bem-sucedida
    TradingInterface.inicializarConfiguracoes();

  }

  if (erro) {
    console.error(`❌ Erro na ordem espelho: ${erro}`);
  }

  // Aqui você pode adicionar lógica adicional para processar resultados
  // Por exemplo, atualizar interface ou estatísticas
}

}

// ============================
// LIQUIDITYHANDLER - DADOS DE LIQUIDEZ
// ============================

class LiquidityHandler {
  constructor(appState, enviarCallback) {
    this.appState = appState;
    this.enviar = enviarCallback;
  }

  handle(message) {
    const { origem, liquidez } = message;
    
    // Só processa mensagens de outras abas
    if (origem === this.appState.data.connection.tipo) {
      return;
    }
    
    // Valida dados de liquidez
    if (!liquidez || typeof liquidez !== 'object') {
      console.warn('⚠️ LiquidityHandler: Dados de liquidez inválidos', message);
      return;
    }
    
    // console.log(`💧 LiquidityHandler: Atualizando liquidez ${origem}`, liquidez);
    
    // Atualiza liquidez no AppState
    this.appState.updateLiquidity(origem, liquidez.entrada, liquidez.saida);
    
    // O LiquidezManager é atualizado automaticamente via listeners do AppState
  }
}

// ============================
// CONFIGHANDLER - SINCRONIZAÇÃO DE CONFIGURAÇÕES
// ============================

class ConfigHandler {
  constructor(appState, enviarCallback) {
    this.appState = appState;
    this.enviar = enviarCallback;
  }

  handle(message) {
    const { origem, config } = message;
    
    // Só processa mensagens de outras abas
    if (origem === this.appState.data.connection.tipo) {
      return;
    }
    
    // Valida dados de configuração
    if (!config || !config.tipo) {
      console.warn('⚠️ ConfigHandler: Dados de configuração inválidos', message);
      return;
    }
    
    console.log(`⚙️ ConfigHandler: Aplicando configuração ${config.tipo}`, config);
    
    // Processa diferentes tipos de configuração
    this.processarConfiguracao(config);
  }

  processarConfiguracao(config) {
    const { tipo: tipoConfig, valor } = config;
    
    switch (tipoConfig) {
      case 'liquidez_toggle':
        this.aplicarLiquidezToggle(valor);
        break;
        
      case 'liquidez_valor':
        this.aplicarLiquidezValor(valor);
        break;
        
      case 'autotrade_toggle':
        this.aplicarAutotradeToggle(valor);
        break;
        
      case 'autotrade_abertura':
        this.aplicarAutotradeAbertura(valor);
        break;
        
      case 'autotrade_fechamento':
        this.aplicarAutotradeFechamento(valor);
        break;
        
      default:
        console.warn(`⚠️ ConfigHandler: Tipo de configuração desconhecido: ${tipoConfig}`);
    }
  }

  aplicarLiquidezToggle(valor) {
    const quantidadetoogle = document.getElementById('toggle-config');
    const quantidademoedas = document.getElementById('quantidade-input');
    
    if (quantidadetoogle && quantidademoedas) {
      quantidadetoogle.checked = valor;
      quantidademoedas.style.display = valor ? 'block' : 'none';
      
      // Atualiza visual do toggle
      if (typeof atualizarVisualToggle === 'function') {
        atualizarVisualToggle('liquidez', valor);
      }
      
      console.log(`⚙️ Toggle liquidez ${valor ? 'ativado' : 'desativado'} remotamente`);
    }
  }

  aplicarLiquidezValor(valor) {
    const quantidademoedas = document.getElementById('quantidade-input');
    const quantidadeStats = document.getElementById('quantidade-stats');

    if (quantidademoedas && quantidadeStats) {
        const token = getTokenFromURL();
        const identificador = gerarIdentificadorComSpotPrimeiro();
        const chaveRestante = `quantidadeMoedasRestante_${identificador}`;
        const chaveTotal = `quantidadeMoedas_${identificador}`;

        quantidademoedas.value = valor;

        chrome.storage.local.get([chaveRestante], (result) => {
        const restante = result[chaveRestante] ?? valor;
        quantidadeStats.textContent = `${restante} / ${valor}`;
        });

        // Atualiza também o total no storage com o novo valor
        chrome.storage.local.set({ [chaveTotal]: valor }, () => {
        console.log(`💾 quantidadeMoedas atualizada: ${valor}`);
        });

        console.log(`⚙️ Valor liquidez definido remotamente para ${token}: ${valor}`);
    }
  }



  aplicarAutotradeToggle(valor) {
    const autotradeToggle = document.getElementById('autotrade-toggle');
    if (autotradeToggle) {
      autotradeToggle.checked = valor;
      
      // Atualiza estado no AppState
      this.appState.setAutotradeActive(valor);
      
      // Controla monitoramento
      if (valor && this.appState.data.connection.tipo === 'spot') {
        if (typeof iniciarMonitoramento === 'function') {
          iniciarMonitoramento();
        }
      } else {
        if (typeof pararMonitoramento === 'function') {
          pararMonitoramento();
        }
      }
      
      // Atualiza visual do toggle
      if (typeof atualizarVisualToggle === 'function') {
        atualizarVisualToggle('autotrade', valor);
      }
      
      console.log(`⚙️ Toggle autotrade ${valor ? 'ativado' : 'desativado'} remotamente`);
    }
  }

  aplicarAutotradeAbertura(valor) {
    const aberturaInput = document.getElementById('autotrade-abertura');
    if (aberturaInput) {
      aberturaInput.value = valor;
      this.appState.setAutotradePercentages(parseFloat(valor) || null);
      console.log(`⚙️ Valor abertura autotrade definido remotamente: ${valor}%`);
    }
  }

  aplicarAutotradeFechamento(valor) {
    const fechamentoInput = document.getElementById('autotrade-fechamento');
    if (fechamentoInput) {
      fechamentoInput.value = valor;
      this.appState.setAutotradePercentages(null, parseFloat(valor) || null);
      console.log(`⚙️ Valor fechamento autotrade definido remotamente: ${valor}%`);
    }
  }
}

// ============================
// SYNCHANDLER - SINCRONIZAÇÃO GERAL
// ============================

class SyncHandler {
  constructor(appState, enviarCallback) {
    this.appState = appState;
    this.enviar = enviarCallback;
  }

  handle(message) {
    const { tipo: msgTipo } = message;
    
    console.log(`🔄 SyncHandler: Processando ${msgTipo}`);
    
    // Sincronização geral (repassa via postMessage)
    if (msgTipo.startsWith('atualizar')) {
      window.postMessage(message, '*');
      return;
    }
    
    // Outros tipos de sincronização podem ser adicionados aqui
    console.log(`📝 SyncHandler: Mensagem processada: ${msgTipo}`);
  }
}

class ToastHandler {
  constructor(appState, enviarCallback) {
    this.appState = appState;
    this.enviar = enviarCallback;
  }

  handle(message) {
    const { tipo: msgTipo, origem } = message;
    
    if (origem === this.appState.data.connection.tipo) {
      return;
    }
    
    switch (msgTipo) {
      case 'toast_show':
        this.handleToastShow(message);
        break;
        
      case 'toast_dismiss_all':
        this.handleToastDismissAll();
        break;
    }
  }

  handleToastShow(message) {
    const { msg, type, duration } = message;
    if (typeof showToast !== 'undefined') {
      showToast(msg, type, duration);
    }
  }

  handleToastDismissAll() {
    if (typeof dismissAllToasts !== 'undefined') {
      dismissAllToasts();
    }
  }
}

// ============================
// INSTÂNCIA GLOBAL E INTEGRAÇÃO
// ============================

/**
 * Cria instância global do MessageHandler
 * Deve ser chamado após AppState estar disponível
 */
function createMessageHandler(appState, enviarCallback) {
  if (!appState) {
    console.error('❌ AppState é obrigatório para criar MessageHandler');
    return null;
  }
  
  if (!enviarCallback || typeof enviarCallback !== 'function') {
    console.error('❌ Callback de envio é obrigatório para criar MessageHandler');
    return null;
  }
  
  return new MessageHandler(appState, enviarCallback);
}

/**
 * Função de compatibilidade para substituir handleMessage original
 * Deve ser chamada no content.js onde handleMessage estava sendo usada
 */
function replaceHandleMessage(messageHandler) {
  if (!messageHandler) {
    console.error('❌ MessageHandler não fornecido para replaceHandleMessage');
    return (msg) => console.warn('⚠️ MessageHandler não configurado', msg);
  }
  
  return (message) => messageHandler.handle(message);
}