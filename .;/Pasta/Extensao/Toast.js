// ============================
// TOAST.JS - SISTEMA SIMPLES
// ============================

class ToastSystem {
  constructor() {
    this.container = null;
    this.activeToasts = new Map();
    this.toastCounter = 0;
    
    this.init();
  }

  init() {
    this.createContainer();
    this.injectStyles();
  }

  createContainer() {
    const existing = document.getElementById('toast-container');
    if (existing) existing.remove();

    this.container = document.createElement('div');
    this.container.id = 'toast-container';
    
    Object.assign(this.container.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: '99999',
      pointerEvents: 'none',
      fontFamily: 'Inter, sans-serif'
    });

    document.body.appendChild(this.container);
  }

  injectStyles() {
    const styles = `
      .toast-container {
        display: flex;
        flex-direction: column;
        gap: 12px;
        max-width: 380px;
      }

      .toast {
        pointer-events: auto;
        min-width: 320px;
        max-width: 380px;
        padding: 18px 22px;
        border-radius: 12px;
        font-family: Inter, sans-serif !important;
        font-size: 14px !important;
        font-weight: 500;
        line-height: 1.4;
        box-shadow: 0 0 12px rgba(0, 255, 150, 0.3), 0 8px 32px rgba(0, 0, 0, 0.4);
        border: 1px solid rgb(28, 28, 28);
        backdrop-filter: blur(10px);
        position: relative;
        transform: translateX(100%);
        opacity: 0;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        cursor: pointer;
        background: #000;
        color: #fff;
        overflow: hidden;
      }

      .toast::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(0, 255, 150, 0.1) 0%, rgba(0, 255, 150, 0.05) 100%);
        z-index: -1;
      }

      .toast.show {
        transform: translateX(0);
        opacity: 1;
      }

      .toast.hide {
        transform: translateX(100%);
        opacity: 0;
        margin-top: -80px;
        padding-top: 0;
        padding-bottom: 0;
        min-height: 0;
      }

      .toast.success { 
        border-color: #00c851;
        box-shadow: 0 0 12px rgba(0, 200, 81, 0.4), 0 8px 32px rgba(0, 0, 0, 0.4);
      }
      .toast.success::before {
        background: linear-gradient(135deg, rgba(0, 200, 81, 0.15) 0%, rgba(0, 200, 81, 0.05) 100%);
      }

      .toast.error { 
        border-color: #ff4444;
        box-shadow: 0 0 12px rgba(255, 68, 68, 0.4), 0 8px 32px rgba(0, 0, 0, 0.4);
      }
      .toast.error::before {
        background: linear-gradient(135deg, rgba(255, 68, 68, 0.15) 0%, rgba(255, 68, 68, 0.05) 100%);
      }

      .toast.warning { 
        border-color: #facc15;
        box-shadow: 0 0 12px rgba(250, 204, 21, 0.4), 0 8px 32px rgba(0, 0, 0, 0.4);
      }
      .toast.warning::before {
        background: linear-gradient(135deg, rgba(250, 204, 21, 0.15) 0%, rgba(250, 204, 21, 0.05) 100%);
      }

      .toast.info { 
        border-color: #3b82f6;
        box-shadow: 0 0 12px rgba(59, 130, 246, 0.4), 0 8px 32px rgba(0, 0, 0, 0.4);
      }
      .toast.info::before {
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.05) 100%);
      }

      .toast-content {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        position: relative;
        z-index: 1;
      }

      .toast-message {
        flex: 1;
        margin-right: 16px;
        word-wrap: break-word;
        line-height: 1.5;
      }

      .toast-close {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.7);
        font-size: 20px !important;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.2s ease;
        flex-shrink: 0;
        margin-top: -2px;
      }

      .toast-close:hover {
        color: #fff;
        background: rgba(255, 255, 255, 0.1);
        transform: scale(1.1);
      }

      .toast-progress {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 2px;
        background: rgba(0, 255, 150, 0.6);
        border-radius: 0 0 12px 12px;
        animation: toast-progress linear;
        z-index: 2;
      }

      .toast.success .toast-progress {
        background: rgba(0, 200, 81, 0.8);
      }

      .toast.error .toast-progress {
        background: rgba(255, 68, 68, 0.8);
      }

      .toast.warning .toast-progress {
        background: rgba(250, 204, 21, 0.8);
      }

      .toast.info .toast-progress {
        background: rgba(59, 130, 246, 0.8);
      }

      @keyframes toast-progress {
        from { width: 100%; }
        to { width: 0%; }
      }

      .toast:hover .toast-progress {
        animation-play-state: paused;
      }

      .toast:hover {
        transform: translateX(-8px);
        box-shadow: 0 0 20px rgba(0, 255, 150, 0.4), 0 12px 40px rgba(0, 0, 0, 0.5);
      }

      .toast.success:hover {
        box-shadow: 0 0 20px rgba(0, 200, 81, 0.5), 0 12px 40px rgba(0, 0, 0, 0.5);
      }

      .toast.error:hover {
        box-shadow: 0 0 20px rgba(255, 68, 68, 0.5), 0 12px 40px rgba(0, 0, 0, 0.5);
      }

      .toast.warning:hover {
        box-shadow: 0 0 20px rgba(250, 204, 21, 0.5), 0 12px 40px rgba(0, 0, 0, 0.5);
      }

      .toast.info:hover {
        box-shadow: 0 0 20px rgba(59, 130, 246, 0.5), 0 12px 40px rgba(0, 0, 0, 0.5);
      }

      @media (max-width: 480px) {
        .toast-container {
          left: 10px;
          right: 10px;
          top: 10px;
        }
        
        .toast {
          min-width: auto;
          max-width: none;
        }
      }
    `;

    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
  }

  // ============================
  // MÉTODO PRINCIPAL
  // ============================
  showToast(msg, type = 'info', duration = 4000) {
    const toastId = `toast-${++this.toastCounter}`;
    
    const toastElement = document.createElement('div');
    toastElement.className = `toast ${type}`;
    toastElement.id = toastId;
    
    toastElement.innerHTML = `
      <div class="toast-content">
        <div class="toast-message">${msg}</div>
        <button class="toast-close">×</button>
      </div>
      ${duration > 0 ? `<div class="toast-progress" style="animation-duration: ${duration}ms;"></div>` : ''}
    `;
    
    this.container.appendChild(toastElement);
    
    // Animação de entrada
    requestAnimationFrame(() => {
      toastElement.classList.add('show');
    });
    
    // Auto dismiss
    let timer = null;
    if (duration > 0) {
      timer = setTimeout(() => {
        this.dismiss(toastId);
      }, duration);
    }
    
    // Eventos
    toastElement.addEventListener('click', () => {
      this.dismiss(toastId);
    });
    
    toastElement.querySelector('.toast-close').addEventListener('click', (e) => {
      e.stopPropagation();
      this.dismiss(toastId);
    });
    
    // Pausa timer no hover
    if (timer) {
      toastElement.addEventListener('mouseenter', () => {
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
      });
      
      toastElement.addEventListener('mouseleave', () => {
        if (!timer && duration > 0) {
          timer = setTimeout(() => {
            this.dismiss(toastId);
          }, 1000); // Espera 1s extra após sair do hover
        }
      });
    }
    
    this.activeToasts.set(toastId, { element: toastElement, timer });
    
    return toastId;
  }

  dismiss(toastId) {
    const toast = this.activeToasts.get(toastId);
    if (!toast) return;
    
    const { element, timer } = toast;
    
    if (timer) clearTimeout(timer);
    
    element.classList.add('hide');
    
    setTimeout(() => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
      this.activeToasts.delete(toastId);
    }, 300);
  }

  // ============================
  // REMOVER TODOS
  // ============================
  dismissAll() {
    this.activeToasts.forEach((_, toastId) => {
      this.dismiss(toastId);
    });
  }
}

// ============================
// INSTÂNCIA GLOBAL
// ============================
const toast = new ToastSystem();

// Método global
window.showToast = (msg, type = 'info', duration = 4000) => {
  return toast.showToast(msg, type, duration);
};

// Remover todos
window.dismissAllToasts = () => {
  return toast.dismissAll();
};

function enviarToast(msg, type = 'info', duration = 4000) {
  // Mostra local
  showToast(msg, type, duration);
  
  // Envia para outras abas
  if (typeof enviar === 'function') {
    enviar({
      tipo: 'toast_show',
      origem: appState.data.connection.tipo,
      msg: msg,
      type: type,
      duration: duration,
      token: appState.data.connection.token,
      timestamp: Date.now()
    });
  }
}

function enviarDismissAll() {
  // Remove local
  dismissAllToasts();
  
  // Envia para outras abas
  if (typeof enviar === 'function') {
    enviar({
      tipo: 'toast_dismiss_all',
      origem: appState.data.connection.tipo,
      token: appState.data.connection.token,
      timestamp: Date.now()
    });
  }
}