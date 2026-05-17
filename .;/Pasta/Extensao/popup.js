// ============================
// POPUP SCRIPT OTIMIZADO
// ============================

class PopupManager {
  constructor() {
    this.elements = {};
    this.state = {
      connections: {},
      stats: {
        activeTokens: 0,
        totalConnections: 0,
        avgLatency: 0
      },
      settings: {
        updateInterval: 100,
        debugMode: false
      }
    };
    
    this.updateInterval = null;
    this.initialize();
  }

  initialize() {
    this.cacheElements();
    this.loadSettings();
    this.setupEventListeners();
    this.startUpdates();
    
    console.log('📊 Popup Manager inicializado');
  }

  cacheElements() {
    const elementIds = [
      'spot-status', 'futures-status', 'spot-status-text', 'futures-status-text',
      'active-tokens', 'total-connections', 'avg-latency',
      'refresh-btn', 'settings-btn', 'refresh-icon',
      'advanced-section', 'update-interval', 'debug-mode', 'clear-cache-btn',
      'github-link', 'support-link', 'docs-link'
    ];

    elementIds.forEach(id => {
      this.elements[id] = document.getElementById(id);
    });
  }

  loadSettings() {
    // Carrega configurações do storage
    chrome.storage.sync.get(['updateInterval', 'debugMode'], (result) => {
      if (result.updateInterval) {
        this.state.settings.updateInterval = result.updateInterval;
        this.elements['update-interval'].value = result.updateInterval;
      }
      
      if (result.debugMode !== undefined) {
        this.state.settings.debugMode = result.debugMode;
        this.elements['debug-mode'].checked = result.debugMode;
      }
    });
  }

  setupEventListeners() {
    // Botão refresh
    this.elements['refresh-btn'].onclick = () => {
      this.refreshConnections();
    };

    // Botão configurações
    this.elements['settings-btn'].onclick = () => {
      this.toggleAdvancedSection();
    };

    // Input de intervalo
    this.elements['update-interval'].onchange = (e) => {
      const value = parseInt(e.target.value);
      if (value >= 50 && value <= 5000) {
        this.state.settings.updateInterval = value;
        this.saveSettings();
        this.restartUpdates();
      }
    };

    // Checkbox debug
    this.elements['debug-mode'].onchange = (e) => {
      this.state.settings.debugMode = e.target.checked;
      this.saveSettings();
      this.toggleDebugMode(e.target.checked);
    };

    // Botão limpar cache
    this.elements['clear-cache-btn'].onclick = () => {
      this.clearCache();
    };

    // Links do footer
    this.elements['github-link'].onclick = (e) => {
      e.preventDefault();
      chrome.tabs.create({ url: 'https://github.com/seu-usuario/arbitrage-tracker' });
    };

    this.elements['support-link'].onclick = (e) => {
      e.preventDefault();
      chrome.tabs.create({ url: 'mailto:support@arbitragetracker.com' });
    };

    this.elements['docs-link'].onclick = (e) => {
      e.preventDefault();
      chrome.tabs.create({ url: 'https://docs.arbitragetracker.com' });
    };
  }

  startUpdates() {
    this.updateConnections();
    this.updateInterval = setInterval(() => {
      this.updateConnections();
    }, this.state.settings.updateInterval);
  }

  restartUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    this.startUpdates();
  }

  stopUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  async updateConnections() {
    try {
      // Obtém informações do background script
      const response = await this.sendMessageToBackground({ action: 'getStatus' });
      
      if (response) {
        this.updateConnectionStatus(response.connections);
        this.updateStats(response.stats);
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar conexões:', error);
      this.showError();
    }
  }

  updateConnectionStatus(connections) {
    this.state.connections = connections || {};
    
    // Verifica se há conexões spot
    const hasSpotConnections = Object.values(connections).some(conn => conn.spot);
    const hasFuturesConnections = Object.values(connections).some(conn => conn.futures);
    
    // Atualiza status visual
    this.updateStatusCard('spot', hasSpotConnections);
    this.updateStatusCard('futures', hasFuturesConnections);
  }

  updateStatusCard(type, isConnected) {
    const statusCard = this.elements[`${type}-status`];
    const statusText = this.elements[`${type}-status-text`];
    
    if (isConnected) {
      statusCard.className = 'status-card connected';
      statusText.innerHTML = '🟢 Conectado';
    } else {
      statusCard.className = 'status-card disconnected';
      statusText.innerHTML = '🔴 Desconectado';
    }
  }

  updateStats(stats) {
    if (!stats) return;
    
    this.state.stats = { ...this.state.stats, ...stats };
    
    this.elements['active-tokens'].textContent = this.state.stats.activeTokens || 0;
    this.elements['total-connections'].textContent = this.state.stats.totalConnections || 0;
    
    const latency = this.state.stats.avgLatency;
    this.elements['avg-latency'].textContent = latency > 0 ? `${latency}ms` : '-';
  }

  refreshConnections() {
    // Animação do botão
    const icon = this.elements['refresh-icon'];
    icon.style.animation = 'spin 1s ease-in-out';
    
    setTimeout(() => {
      icon.style.animation = '';
    }, 1000);

    // Força atualização
    this.updateConnections();
    
    // Envia comando para reconectar
    this.sendMessageToBackground({ action: 'reconnectAll' });
  }

  toggleAdvancedSection() {
    const section = this.elements['advanced-section'];
    const isHidden = section.classList.contains('hidden');
    
    if (isHidden) {
      section.classList.remove('hidden');
      this.elements['settings-btn'].textContent = '🔼 Config';
    } else {
      section.classList.add('hidden');
      this.elements['settings-btn'].textContent = '⚙️ Config';
    }
  }

  toggleDebugMode(enabled) {
    // Envia comando para habilitar/desabilitar debug
    this.sendMessageToBackground({ 
      action: 'setDebugMode', 
      enabled 
    });
    
    if (enabled) {
      console.log('🐛 Modo debug habilitado');
    } else {
      console.log('🐛 Modo debug desabilitado');
    }
  }

  clearCache() {
    // Confirma ação
    if (!confirm('Deseja limpar todo o cache? Esta ação não pode ser desfeita.')) {
      return;
    }
    
    // Limpa storage local
    chrome.storage.local.clear();
    chrome.storage.sync.clear();
    
    // Envia comando para limpar cache do background
    this.sendMessageToBackground({ action: 'clearCache' });
    
    // Feedback visual
    const btn = this.elements['clear-cache-btn'];
    const originalText = btn.textContent;
    btn.textContent = '✅ Limpo!';
    btn.disabled = true;
    
    setTimeout(() => {
      btn.textContent = originalText;
      btn.disabled = false;
    }, 2000);
  }

  saveSettings() {
    chrome.storage.sync.set({
      updateInterval: this.state.settings.updateInterval,
      debugMode: this.state.settings.debugMode
    });
  }

  sendMessageToBackground(message) {
    return new Promise((resolve, reject) => {
      try {
        chrome.runtime.sendMessage(message, (response) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(response);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  showError() {
    // Mostra estado de erro
    this.updateStatusCard('spot', false);
    this.updateStatusCard('futures', false);
    
    this.elements['active-tokens'].textContent = '?';
    this.elements['total-connections'].textContent = '?';
    this.elements['avg-latency'].textContent = 'Error';
  }

  // Método para cleanup ao fechar popup
  destroy() {
    this.stopUpdates();
  }
}

// ============================
// INICIALIZAÇÃO
// ============================
let popupManager = null;

document.addEventListener('DOMContentLoaded', () => {
  try {
    popupManager = new PopupManager();
  } catch (error) {
    console.error('❌ Erro ao inicializar popup:', error);
  }
});

// Cleanup ao fechar
window.addEventListener('beforeunload', () => {
  if (popupManager) {
    popupManager.destroy();
  }
});

// Trata erros globais
window.addEventListener('error', (event) => {
  console.error('❌ Erro no popup:', event.error);
});

// Expõe para debugging
if (typeof globalThis !== 'undefined') {
  globalThis.popupManager = popupManager;
}