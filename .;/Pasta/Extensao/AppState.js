// ============================
// APPSTATE.JS OTIMIZADO
// ============================

class AppState {
  constructor() {
    this.data = {
      connection: { connected: false, token: null, tipo: null },
      mexc: { cs: null, cs_futures: null, Coin_id_spot_mexc: null },
      market: { 
        spot: { bid: null, ask: null }, 
        futures: { bid: null, ask: null },
        lastUpdate: { spot: 0, futures: 0 }
      },
      liquidity: { 
        spot: { entrada: 0, saida: 0 }, 
        futures: { entrada: 0, saida: 0 }
      },
      trading: { 
        orderPending: false, 
        orderType: null, 
        orderQuantity: null,
        orderStartTime: null,
        monitorInterval: null
      },
      autotrade: { 
        ativo: false, 
        percentualAbertura: null, 
        percentualFechamento: null,
        monitoringInterval: null,
        posicaoAberta: false,
        ultimaVerificacao: 0
      },
      config: { liquidez: { enabled: false, valor: null } }
    };

    this.listeners = new Map();
  }

  // ============================
  // GETTERS RÁPIDOS
  // ============================
  get conectado() { return this.data.connection.connected; }
  get dados() { return this.data.market; }
  get liquidez() { return this.data.liquidity; }
  get tradingState() { return this.data.trading; }
  get autotradeState() { return this.data.autotrade; }

  // ============================
  // CONEXÃO
  // ============================
  setConnection(connected, token = null, tipo = null) {
    this.data.connection.connected = connected;
    if (token) this.data.connection.token = token;
    if (tipo) this.data.connection.tipo = tipo;
    this.emit('connection:changed', this.data.connection);
  }

  getConnectionInfo() {
    return { ...this.data.connection };
  }

  // ============================
  // DADOS DE MERCADO
  // ============================
  updateMarketData(type, data) {
    if (!['spot', 'futures'].includes(type)) return;

    this.data.market[type] = { ...data };
    this.data.market.lastUpdate[type] = Date.now();
    this.emit('market:updated', { type, data: this.data.market[type] });
  }

  getMarketData(type = null) {
    return type ? { ...this.data.market[type] } : { ...this.data.market };
  }

  hasValidMarketData(type) {
    const data = this.data.market[type];
    return data?.bid && data?.ask;
  }

  // ============================
  // LIQUIDEZ
  // ============================
  updateLiquidity(type, entrada = null, saida = null) {
    if (!['spot', 'futures'].includes(type)) return;

    if (entrada !== null) this.data.liquidity[type].entrada = parseFloat(entrada) || 0;
    if (saida !== null) this.data.liquidity[type].saida = parseFloat(saida) || 0;
    
    this.emit('liquidity:updated', { type, data: this.data.liquidity[type] });
  }

  getLiquidity(type = null) {
    return type ? { ...this.data.liquidity[type] } : { ...this.data.liquidity };
  }

  getPageWithLowerLiquidity(acao) {
    const { spot, futures } = this.data.liquidity;
    
    const liquidezSpot = acao === 'comprar' ? spot.entrada : spot.saida;
    const liquidezFutures = acao === 'comprar' ? futures.entrada : futures.saida;
    
    if (liquidezSpot === 0 && liquidezFutures === 0) return null;
    if (liquidezSpot === 0) return 'futures';
    if (liquidezFutures === 0) return 'spot';
    
    return liquidezSpot <= liquidezFutures ? 'spot' : 'futures';
  }

  hasLowerLiquidity(acao) {
    return this.getPageWithLowerLiquidity(acao) === this.data.connection.tipo;
  }

  // ============================
  // TRADING
  // ============================
  setTradingOrder(type, quantity, startTime = null) {
    this.data.trading.orderPending = true;
    this.data.trading.orderType = type;
    this.data.trading.orderQuantity = quantity;
    this.data.trading.orderStartTime = startTime || Date.now();
    this.emit('trading:order_started', this.data.trading);
  }

  clearTradingOrder() {
    this.data.trading.orderPending = false;
    this.data.trading.orderType = null;
    this.data.trading.orderQuantity = null;
    this.data.trading.orderStartTime = null;
    
    if (this.data.trading.monitorInterval) {
      clearInterval(this.data.trading.monitorInterval);
      this.data.trading.monitorInterval = null;
    }
    
    this.emit('trading:order_cleared', this.data.trading);
  }

  getTradingState() {
    return { ...this.data.trading };
  }

  isTradingPending() {
    return this.data.trading.orderPending;
  }

  // ============================
  // AUTOTRADE
  // ============================
  setAutotradeActive(active) {
    this.data.autotrade.ativo = active;
    this.emit('autotrade:status_changed', { active });
  }

  setAutotradePercentages(abertura, fechamento) {
    if (abertura !== undefined) {
      this.data.autotrade.percentualAbertura = abertura === null || abertura === '' ? null : parseFloat(abertura);
    }
    if (fechamento !== undefined) {
      this.data.autotrade.percentualFechamento = fechamento === null || fechamento === '' ? null : parseFloat(fechamento);
    }
    
    this.emit('autotrade:config_changed', {
      abertura: this.data.autotrade.percentualAbertura,
      fechamento: this.data.autotrade.percentualFechamento
    });
  }

  getAutotradeState() {
    return { ...this.data.autotrade };
  }

  // ============================
  // BOOK DATA (EXTENSÕES)
  // ============================
  updateBookData(tipo, precoTipo, ordensArray) {
    if (!this.data.bookData) this.data.bookData = {};
    if (!this.data.bookData[tipo]) this.data.bookData[tipo] = {};
    
    this.data.bookData[tipo][precoTipo] = ordensArray;
    this.emit('book:updated', { tipo, precoTipo, orders: ordensArray });
  }

  getBookData(tipo, precoTipo = null) {
    if (!this.data.bookData?.[tipo]) {
      return precoTipo ? [] : {};
    }
    return precoTipo ? (this.data.bookData[tipo][precoTipo] || []) : this.data.bookData[tipo];
  }

  // ============================
  // SISTEMA DE EVENTOS
  // ============================
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`❌ Erro listener ${event}:`, error);
        }
      });
    }
  }

  // ============================
  // VALIDAÇÕES
  // ============================
  validateTradingConfig() {
    return this.data.connection.connected && 
           this.data.connection.tipo && 
           this.data.connection.token;
  }

  // ============================
  // DEBUG
  // ============================
  getFullState() {
    return JSON.parse(JSON.stringify(this.data));
  }

  logState() {
    console.log('📊 Estado AppState:', this.getFullState());
  }
}

// ============================
// INSTÂNCIA GLOBAL
// ============================
const appState = new AppState();

// Export para módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AppState;
}