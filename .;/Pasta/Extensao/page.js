
// ============================
// UTILS DOM & INTERFACE
// ============================
const DOMUtils = {
  // Cache de elementos para performance
  cache: new Map(),
  
  get(selector) {
    if (!this.cache.has(selector)) {
      this.cache.set(selector, document.querySelector(selector));
    }
    return this.cache.get(selector);
  },
  
  getAll(selector) {
    return document.querySelectorAll(selector);
  },
  
  clearCache() {
    this.cache.clear();
  },
  
  createElement(tag, styles = {}, content = '') {
    const element = document.createElement(tag);
    Object.assign(element.style, styles);
    if (content) element.innerHTML = content;
    return element;
  },
  
  // Injeta CSS global
  injectCSS(css) {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    return style;
  }
};

// ============================
// UTILS DE POPUP
// ============================
const PopupUtils = {
  // Configurações padrão do popup
  config: {
    position: 'fixed',
    width: '320px',
    minWidth: '320px',
    maxWidth: '320px',
    backgroundColor: '#000',
    border: '1px solid rgb(28,28,28)',
    borderRadius: '12px',
    boxShadow: '0 0 12px rgba(0, 255, 150, 0.3)',
    padding: '15px',
    zIndex: 9999,
    fontFamily: 'Inter, sans-serif !important',
    color: '#fff',
    fontSize: '14px !important',
    cursor: 'move',
    boxSizing: 'border-box',
    lineHeight: '18.915px'
  },
  
  // CSS base para injeção
  baseCSS: `
    #popup-fixo-extensao,
    #popup-fixo-extensao * {
      font-family: Inter, sans-serif !important;
      font-size: inherit !important;
    }
    #popup-fixo-extensao {
      font-size: 14px !important;
    }
    
    /* Estilos para toggles */
    #toggle-config:checked + .liquidez-slider-bg {
      background-color: #00c851 !important;
    }
    #toggle-config:checked + .liquidez-slider-bg + .liquidez-slider-ball {
      transform: translateX(16px);
    }
    
    #autotrade-toggle:checked + .autotrade-slider-bg {
      background-color: #00c851 !important;
    }
    #autotrade-toggle:checked + .autotrade-slider-bg + .autotrade-slider-ball {
      transform: translateX(16px);
    }
    
    /* Animações suaves */
    .liquidez-slider-ball, .autotrade-slider-ball {
      transition: transform 0.4s ease !important;
    }
    .liquidez-slider-bg, .autotrade-slider-bg {
      transition: background-color 0.4s ease !important;
    }
  `,
  
  // Cria estrutura base do popup
  criarEstrutura(token) {
    return `
      <div id="popup-header" style="display:flex;justify-content:center;align-items:center;margin-bottom:15px;position:relative;cursor:move">
        <span style="color:#fff;font-weight:bold;font-size:20px !important;pointer-events:none;font-family:Inter,sans-serif !important">${token}</span>
        <button id="fechar-popup" style="background:none;border:none;font-size:20px !important;color:#fff;cursor:pointer;position:absolute;top:0;right:0;font-family:Inter,sans-serif !important">✕</button>
      </div>
      <div style="background:#000;border-radius:12px;padding:15px;font-family:Inter,sans-serif !important">
        ${this.criarSecaoArbitragem()}
      </div>
      <div id="status-conn" style="position:absolute;bottom:10px;left:15px;font-weight:bold;font-size:13px !important;font-family:Inter,sans-serif !important">🔴 Não conectado</div>
    `;
  },
  
  // Seção de arbitragem com trading
  criarSecaoArbitragem() {
    return `
      <div style="display:flex;justify-content:space-between;margin-bottom:10px">
        <div style="text-align:center;flex:1"><div style="color:#aaa;font-size:14px !important;font-family:Inter,sans-serif !important">SPOT</div><div id="valor-spot" style="font-size:18px !important;font-weight:bold;font-family:Inter,sans-serif !important">0.000000</div></div>
        <div style="text-align:center;flex:1"><div style="color:#aaa;font-size:14px !important;font-family:Inter,sans-serif !important">Entrada</div><div id="lucro-entrada" style="font-size:20px !important;font-weight:bold;font-family:Inter,sans-serif !important">N/A</div></div>
        <div style="text-align:center;flex:1"><div style="color:#aaa;font-size:14px !important;font-family:Inter,sans-serif !important">FUTURES</div><div id="valor-futures" style="font-size:18px !important;font-weight:bold;font-family:Inter,sans-serif !important">0.000000</div></div>
      </div>
      <div style="text-align:center;margin:5px 0 15px"><div id="liquidez-entrada" style="font-size:12px !important;color:#facc15;font-family:Inter,sans-serif !important">Liquidez: N/A</div></div>
      <div style="display:flex;justify-content:space-between;margin-bottom:10px">
        <div style="text-align:center;flex:1"><div style="color:#aaa;font-size:14px !important;font-family:Inter,sans-serif !important">SPOT</div><div id="valor-spot-saida" style="font-size:18px !important;font-weight:bold;font-family:Inter,sans-serif !important">0.000000</div></div>
        <div style="text-align:center;flex:1"><div style="color:#aaa;font-size:14px !important;font-family:Inter,sans-serif !important">Saída</div><div id="lucro-saida" style="font-size:20px !important;font-weight:bold;font-family:Inter,sans-serif !important">N/A</div></div>
        <div style="text-align:center;flex:1"><div style="color:#aaa;font-size:14px !important;font-family:Inter,sans-serif !important">FUTURES</div><div id="valor-futures-saida" style="font-size:18px !important;font-weight:bold;font-family:Inter,sans-serif !important">0.000000</div></div>
      </div>
      <div style="text-align:center;margin:5px 0 15px"><div id="liquidez-saida" style="font-size:12px !important;color:#facc15;font-family:Inter,sans-serif !important">Liquidez: N/A</div></div>
      
      <div style="margin-top:15px;padding-top:15px;border-top:1px solid #333">        
        <div id="trading-status" style="text-align:center;margin-top:8px;font-size:12px !important;color:#aaa;font-family:Inter,sans-serif !important;min-height:18px"></div>
      </div>

      <div style="background:#111;border:1px solid rgb(28,28,28);border-radius:12px;padding:15px;margin-top:15px">
        <div id="accordion-header" style="display:flex;justify-content:space-between;align-items:center;cursor:pointer">
          <span style="font-family:Inter,sans-serif !important;color:white;font-size:18px !important;font-weight:600">Configurações</span>
          <span id="accordion-icon" style="color:white;font-size:18px !important">+</span>
        </div>
        
        <div id="accordion-content" style="display:none;margin-top:15px">
          <div style="display:flex;flex-direction:column;gap:10px">
            <div style="display:flex;justify-content:space-between;align-items:center">
            <label style="font-size:14px !important;color:#ccc;font-family:Inter,sans-serif !important">Moedas</label>
                <div style="display:flex;align-items:center;gap:10px">
                    <span id="quantidade-stats" style="font-size:12px !important;color:#facc15;font-family:Inter,sans-serif !important">0 / 0</span>
                    <label style="position:relative;display:inline-block;width:36px;height:20px">
                    <input type="checkbox" id="toggle-config" style="opacity:0;width:0;height:0">
                    <span class="liquidez-slider-bg" style="position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background-color:#444;transition:.4s;border-radius:34px"></span>
                    <span class="liquidez-slider-ball" style="position:absolute;height:14px;width:14px;left:3px;bottom:3px;background-color:white;border-radius:50%;transition:.4s"></span>
                    </label>
                </div>
            </div>

            <input type="number" id="quantidade-input" placeholder="Total de Moedas..." style="width:100%;padding:10px 14px;border:1px solid rgb(222,222,222);background:#000;color:#fff;border-radius:8px;font-size:15px !important;font-family:Inter,sans-serif !important;outline:none;box-sizing:border-box;margin-top:8px">

            <div style="margin-bottom:10px">
                <label style="font-size:14px !important;color:#ccc;font-family:Inter,sans-serif !important">Quantidade</label>

                <input 
                    id="quantity-input" 
                    type="number" 
                    placeholder="Quantidade" 
                    style="width:100%;padding:10px 14px;border:1px solid rgb(222,222,222);background:#000;color:#fff;border-radius:8px;font-size:15px !important;font-family:Inter,sans-serif !important;outline:none;box-sizing:border-box;margin-top:8px"
                    step="0.01"
                    min="0"
                />
            </div>
          
            <div style="margin-top:20px;border-top:1px solid #333;padding-top:15px">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
                <span style="font-size:14px !important;color:#ccc;font-family:Inter,sans-serif !important">AutoTrade</span>
                <label style="position:relative;display:inline-block;width:36px;height:20px">
                  <input type="checkbox" id="autotrade-toggle" style="opacity:0;width:0;height:0">
                  <span class="autotrade-slider-bg" style="position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background-color:#444;transition:.4s;border-radius:34px"></span>
                  <span class="autotrade-slider-ball" style="position:absolute;height:14px;width:14px;left:3px;bottom:3px;background-color:white;border-radius:50%;transition:.4s"></span>
                </label>
              </div>
              
              <div style="display:flex;flex-wrap:wrap;gap:10px">
                <input id="autotrade-abertura" type="number" placeholder="Entrada %" style="flex:1 1 45%;min-width:100px;padding:8px 10px;border-radius:8px;border:1px solid rgb(222,222,222);background:#000;color:#fff;font-family:Inter,sans-serif !important;font-size:14px !important;box-sizing:border-box">
                <input id="autotrade-fechamento" type="number" placeholder="Saída %" style="flex:1 1 45%;min-width:100px;padding:8px 10px;border-radius:8px;border:1px solid rgb(222,222,222);background:#000;color:#fff;font-family:Inter,sans-serif !important;font-size:14px !important;box-sizing:border-box">
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },
  
  // Cria bolinha minimizada
  criarBolinha() {
    return DOMUtils.createElement('div', {
      display: 'none',
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      width: '45px',
      height: '45px',
      backgroundColor: '#000',
      color: '#fff',
      borderRadius: '50%',
      fontSize: '20px',
      lineHeight: '45px',
      textAlign: 'center',
      cursor: 'pointer',
      zIndex: '9999',
      boxShadow: '0 0 10px rgba(0,255,150,0.5)'
    }, '📊');
  }
};

// ============================
// UTILS DE DRAG & DROP
// ============================
const DragUtils = {
  // Configurações padrão
  config: {
    threshold: 5, // pixels para iniciar drag
    opacity: 0.9,
    cursor: 'grabbing'
  },
  
  // Inicializa drag and drop
  inicializar(elemento) {
    let isDragging = false;
    let startX, startY, initialX, initialY;
    
    const handlers = {
      start: (e) => {
        if (e.target.closest('button') || e.target.closest('input')) return;
        e.preventDefault();
        
        const pos = e.touches ? e.touches[0] : e;
        const rect = elemento.getBoundingClientRect();
        
        startX = pos.clientX;
        startY = pos.clientY;
        initialX = rect.left;
        initialY = rect.top;
        
        isDragging = true;
        elemento.style.cursor = this.config.cursor;
        elemento.style.transition = 'none';
        elemento.style.opacity = this.config.opacity;
      },
      
      move: (e) => {
        if (!isDragging) return;
        e.preventDefault();
        
        const pos = e.touches ? e.touches[0] : e;
        const deltaX = pos.clientX - startX;
        const deltaY = pos.clientY - startY;
        
        const newX = Math.max(0, Math.min(initialX + deltaX, window.innerWidth - elemento.offsetWidth));
        const newY = Math.max(0, Math.min(initialY + deltaY, window.innerHeight - elemento.offsetHeight));
        
        elemento.style.left = `${newX}px`;
        elemento.style.top = `${newY}px`;
        elemento.style.right = 'auto';
      },
      
      end: () => {
        if (!isDragging) return;
        isDragging = false;
        elemento.style.cursor = 'move';
        elemento.style.transition = 'all 0.2s ease';
        elemento.style.opacity = '1';
      }
    };
    
    // Event listeners
    elemento.addEventListener('mousedown', handlers.start);
    elemento.addEventListener('touchstart', handlers.start, { passive: false });
    document.addEventListener('mousemove', handlers.move);
    document.addEventListener('touchmove', handlers.move, { passive: false });
    document.addEventListener('mouseup', handlers.end);
    document.addEventListener('touchend', handlers.end);
    elemento.addEventListener('selectstart', e => isDragging && e.preventDefault());
  }
};

// ============================
// INTERFACE DE TRADING E CONFIGURAÇÕES
// ============================
const TradingInterface = {
  inicializarConfiguracoes() {
    const token = getTokenFromURL();
    const identificador = gerarIdentificadorComSpotPrimeiro();

    // Accordion setup
    const accordionHeader = document.getElementById('accordion-header');
    const accordionContent = document.getElementById('accordion-content');
    const accordionIcon = document.getElementById('accordion-icon');

    if (!accordionHeader || !accordionContent || !accordionIcon) {
      console.warn('⚠️ Elementos de configuração não encontrados');
      return;
    }

    accordionHeader.addEventListener('click', () => {
      const isOpen = accordionContent.style.display !== 'none';
      accordionContent.style.display = isOpen ? 'none' : 'block';
      accordionIcon.textContent = isOpen ? '+' : '−';
    });

    // Elementos
    const quantidadetoogle = document.getElementById('toggle-config');
    const quantidademoedas = document.getElementById('quantidade-input');
    const quantityInput = document.getElementById('quantity-input'); // 👈 novo
    const quantidadeStats = document.getElementById('quantidade-stats');
    const autotradeToggle = document.getElementById('autotrade-toggle');
    const autotradeAbertura = document.getElementById('autotrade-abertura');
    const autotradeClose = document.getElementById('autotrade-fechamento');

    const chaveTotal = `quantidadeMoedas_${identificador}`;
    const chaveRestante = `quantidadeMoedasRestante_${identificador}`;
    const chaveEntrada = `autotradeEntrada_${identificador}`;
    const chaveFechamento = `autotradeFechamento_${identificador}`;
    const chaveQuantidadeOrdem = `quantidadeOrdem_${identificador}`; // 👈 nova chave

    // Carrega valores do storage
    chrome.storage.local.get([
    chaveTotal,
    chaveRestante,
    chaveEntrada,
    chaveFechamento,
    chaveQuantidadeOrdem
    ], (result) => {
    const valorTotal = result[chaveTotal] || '0';
    const valorRestante = result[chaveRestante] ?? valorTotal;
    const entrada = result[chaveEntrada] ?? '';
    const fechamento = result[chaveFechamento] ?? '';
    const quantidadeOrdem = result[chaveQuantidadeOrdem] ?? '';

    if (quantidademoedas) quantidademoedas.value = valorTotal;
    if (quantidadeStats) quantidadeStats.textContent = `${valorRestante} / ${valorTotal}`;
    if (autotradeAbertura) autotradeAbertura.value = entrada;
    if (autotradeClose) autotradeClose.value = fechamento;
    if (quantityInput) quantityInput.value = quantidadeOrdem; // ✅ aplica valor salvo

    appState.setAutotradePercentages(entrada, fechamento);

    });


    // Eventos para salvar alterações
    if (quantidadetoogle && quantidademoedas) {
      quantidadetoogle.addEventListener('change', () => {
        quantidademoedas.style.display = quantidadetoogle.checked ? 'block' : 'none';
        console.log(quantidadetoogle.checked ? '✅ Filtro de liquidez ativado' : '❌ Filtro de liquidez desativado');
      });

      quantidademoedas.addEventListener('input', () => {
        const novoTotal = quantidademoedas.value || '0';

        chrome.storage.local.set({ [chaveTotal]: novoTotal }, () => {
          console.log('💾 quantidadeMoedas salva na extensão:', novoTotal);
        });

        chrome.storage.local.get([chaveRestante], (result) => {
          let restante = result[chaveRestante];
          if (restante === undefined || restante === null) restante = novoTotal;
          if (quantidadeStats) quantidadeStats.textContent = `${restante} / ${novoTotal}`;
        });
      });
    }
    if (quantityInput) {
      quantityInput.addEventListener('input', () => {
        const valorDigitado = quantityInput.value || '';
        chrome.storage.local.set({ [chaveQuantidadeOrdem]: valorDigitado }, () => {
        console.log('💾 quantidadeOrdem salva:', valorDigitado);
       });
     });
    }

    if (autotradeToggle && autotradeAbertura && autotradeClose) {
      autotradeToggle.addEventListener('change', () => {
        autotradeAbertura.style.display = 'block';
        autotradeClose.style.display = 'block';
        // console.log(autotradeToggle.checked ? '✅ AutoTrade ativado' : '❌ AutoTrade desativado');
      });

      autotradeAbertura.addEventListener('input', () => {
        const valor = autotradeAbertura.value;
        chrome.storage.local.set({ [chaveEntrada]: valor }, () => {
          console.log(`💾 lucroEntrada salvo para ${token}: ${valor}`);
        });
      });

      autotradeClose.addEventListener('input', () => {
        const valor = autotradeClose.value;
        chrome.storage.local.set({ [chaveFechamento]: valor }, () => {
          console.log(`💾 lucroFechamento salvo para ${token}: ${valor}`);
        });
      });
    }
    console.log('✅ Configurações inicializadas');
  }
};

// Cache DOM
const DOM = {};
inicializarInterface();

// ============================
// INTERFACE OTIMIZADA
// ============================
// ✅ ADICIONAR no final da função inicializarInterface:
function inicializarInterface() {
  criarPopup();
  configurarEventos();
  inicializarEventosConfiguracao();
  integrarAutotradeComSistema();
  // ✅ NOVO: Adiciona listeners do AppState
  appState.on('market:updated', () => {
    atualizarInterface();
  });
  
  appState.on('connection:changed', (connectionInfo) => {
    atualizarStatusConexao(connectionInfo.connected ? 'connected' : 'disconnected');
  });
  
  appState.on('liquidity:updated', () => {
    // LiquidezManager já é atualizado automaticamente
    // Aqui podemos adicionar outras atualizações se necessário
  });
}

function configurarEventos() {
  // Toggle popup
  DOM.fechar_popup.onclick = () => togglePopup(false);
  DOM.bolinha.onclick = () => togglePopup(true);
}

function togglePopup(show) {
  DOM.popup.style.display = show ? 'block' : 'none';
  DOM.bolinha.style.display = show ? 'none' : 'block';
}

function criarPopup() {
  // Remove popup anterior
  DOM.popup?.remove();
  
  // Cria popup principal
  DOM.popup = DOMUtils.createElement('div', {
    ...PopupUtils.config,
    position: 'fixed',
    cursor: 'move',
    left: `${window.innerWidth - 370}px`,
    top: '50px'
  });
  
  DOM.popup.id = 'popup-fixo-extensao';
  DOM.popup.innerHTML = PopupUtils.criarEstrutura(appState.data.connection.token);
  
  // Cria bolinha
  DOM.bolinha = PopupUtils.criarBolinha();
  DOM.bolinha.id = 'popup-bolinha';
  
  // Adiciona ao DOM
  document.body.append(DOM.popup, DOM.bolinha);
  
  // Injeta CSS
  DOMUtils.injectCSS(PopupUtils.baseCSS);
  
  // Aplica escala
  const scale = 1 / window.devicePixelRatio;
  DOM.popup.style.transform = `scale(${scale})`;
  DOM.popup.style.transformOrigin = 'top left';
  
  // Cache elementos
  cacheElementosDOM();
  
  // Inicializa drag
  DragUtils.inicializar(DOM.popup);
}

function cacheElementosDOM() {
  const selectors = [
    'status-conn', 'valor-spot', 'valor-futures', 'lucro-entrada',
    'valor-spot-saida', 'valor-futures-saida', 'lucro-saida',
    'liquidez-entrada', 'liquidez-saida',
    'fechar-popup', 'accordion-header', 'accordion-content', 'accordion-icon'
  ];
  
  selectors.forEach(id => {
    DOM[id.replace(/-/g, '_')] = DOM.popup.querySelector(`#${id}`);
  });
}

// ============================
// ATUALIZAÇÃO DE INTERFACE OTIMIZADA
// ============================
function atualizarInterface() {
  if (!DOM.popup) return;
  
  // Usa nova lógica de cálculo com liquidez
  atualizarLucrosComLiquidez();

  // Atualiza display de liquidez
  if (typeof LiquidezManager !== 'undefined') {
    LiquidezManager.atualizarDisplay();
  }
  

}

function atualizarSecao(config) {
  const {
    spotEl, futuresEl, lucroEl,
    spotValido, futuresValido,
    spotPreco, futuresPreco,
    tipo
  } = config;
  
  // Atualiza preços
  spotEl.textContent = spotPreco || '0.000000';
  futuresEl.textContent = futuresPreco || '0.000000';
  
  if (spotValido && futuresValido) {
    // Calcula lucro
    const precoSpot = CalcUtils.parsePreco(spotPreco);
    const precoFutures = CalcUtils.parsePreco(futuresPreco);
    
    const lucro = tipo === 'entrada' 
      ? CalcUtils.calcularLucro(precoFutures, precoSpot)
      : CalcUtils.calcularLucro(precoSpot, precoFutures);
    
    lucroEl.textContent = `${lucro}%`;
    lucroEl.style.color = parseFloat(lucro) > 0 ? '#22c55e' : '#ef4444';
  } else {
    lucroEl.textContent = 'N/A';
  }
}

function atualizarStatusConexao(status) {
  if (DOM.status_conn) {
    DOM.status_conn.textContent = status === 'connected' ? '🟢 Conectado' : '🔴 Não conectado';
  }
}