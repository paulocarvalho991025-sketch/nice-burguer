// ============================
// RATE LIMITER OTIMIZADO
// ============================
const RateLimiter = {
  MIN_INTERVAL_MS: 2000,
  
  // Cache em memória para evitar múltiplas consultas ao storage
  _cache: new Map(),
  
  generateKey(corretora, tipo) {
    return `rate_${corretora}_${tipo}_${gerarIdentificadorComSpotPrimeiro()}`;
  },
  
  async canMakeRequest(corretora, tipo) {
    const key = this.generateKey(corretora, tipo);
    const cached = this._cache.get(key);
    const now = Date.now();
    
    // Usa cache se disponível e recente
    if (cached && (now - cached.timestamp) < 100) {
      return (now - cached.lastRequest) >= this.MIN_INTERVAL_MS;
    }
    
    return new Promise(resolve => {
      chrome.storage.local.get([key], result => {
        const lastRequest = result[key] || 0;
        this._cache.set(key, { lastRequest, timestamp: now });
        resolve((now - lastRequest) >= this.MIN_INTERVAL_MS);
      });
    });
  },
  
  async updateLastRequest(corretora, tipo) {
    const key = this.generateKey(corretora, tipo);
    const now = Date.now();
    
    this._cache.set(key, { lastRequest: now, timestamp: now });
    
    return new Promise(resolve => {
      chrome.storage.local.set({ [key]: now }, resolve);
    });
  },
  
  async getTimeUntilNextRequest(corretora, tipo) {
    const key = this.generateKey(corretora, tipo);
    const cached = this._cache.get(key);
    
    if (cached) {
      return Math.max(0, this.MIN_INTERVAL_MS - (Date.now() - cached.lastRequest));
    }
    
    return new Promise(resolve => {
      chrome.storage.local.get([key], result => {
        const lastRequest = result[key] || 0;
        const timeUntil = Math.max(0, this.MIN_INTERVAL_MS - (Date.now() - lastRequest));
        resolve(timeUntil);
      });
    });
  }
};