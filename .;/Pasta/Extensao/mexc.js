// ============================
// MEXC API - CORREÇÃO FINAL DA ASSINATURA
// ============================

function obterMexcKeyDoCookie() {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [nome, valor] = cookie.trim().split('=');
    if (nome === 'u_id') {
      return decodeURIComponent(valor);
    }
  }
  return null;
}

// ✅ IMPLEMENTAÇÃO MD5 IDÊNTICA AO NODE.JS
function md5(message) {
  function rotateLeft(value, amount) {
    const lbits = (value << amount) | (value >>> (32 - amount));
    return lbits;
  }
  
  function addUnsigned(x, y) {
    const x4 = (x & 0x40000000);
    const y4 = (y & 0x40000000);
    const x8 = (x & 0x80000000);
    const y8 = (y & 0x80000000);
    const result = (x & 0x3FFFFFFF) + (y & 0x3FFFFFFF);
    if (x4 & y4) {
      return (result ^ 0x80000000 ^ x8 ^ y8);
    }
    if (x4 | y4) {
      if (result & 0x40000000) {
        return (result ^ 0xC0000000 ^ x8 ^ y8);
      } else {
        return (result ^ 0x40000000 ^ x8 ^ y8);
      }
    } else {
      return (result ^ x8 ^ y8);
    }
  }
  
  function f(x, y, z) {
    return (x & y) | ((~x) & z);
  }
  function g(x, y, z) {
    return (x & z) | (y & (~z));
  }
  function h(x, y, z) {
    return (x ^ y ^ z);
  }
  function i(x, y, z) {
    return (y ^ (x | (~z)));
  }
  
  function ff(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(f(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  
  function gg(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(g(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  
  function hh(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(h(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  
  function ii(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(i(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  
  function convertToWordArray(string) {
    let lWordCount;
    const lMessageLength = string.length;
    const lNumberOfWords_temp1 = lMessageLength + 8;
    const lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
    const lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
    const lWordArray = Array(lNumberOfWords - 1);
    let lBytePosition = 0;
    let lByteCount = 0;
    while (lByteCount < lMessageLength) {
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
      lByteCount++;
    }
    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
    lBytePosition = (lByteCount % 4) * 8;
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
    return lWordArray;
  }
  
  function wordToHex(lValue) {
    let wordToHexValue = "", wordToHexValue_temp = "", lByte, lCount;
    for (lCount = 0; lCount <= 3; lCount++) {
      lByte = (lValue >>> (lCount * 8)) & 255;
      wordToHexValue_temp = "0" + lByte.toString(16);
      wordToHexValue = wordToHexValue + wordToHexValue_temp.substr(wordToHexValue_temp.length - 2, 2);
    }
    return wordToHexValue;
  }
  
  // Converte para UTF-8
  function utf8Encode(string) {
    string = string.replace(/\r\n/g, "\n");
    let utftext = "";
    for (let n = 0; n < string.length; n++) {
      const c = string.charCodeAt(n);
      if (c < 128) {
        utftext += String.fromCharCode(c);
      } else if ((c > 127) && (c < 2048)) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      } else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }
    }
    return utftext;
  }
  
  let x = Array();
  let k, AA, BB, CC, DD, a, b, c, d;
  const S11 = 7, S12 = 12, S13 = 17, S14 = 22;
  const S21 = 5, S22 = 9, S23 = 14, S24 = 20;
  const S31 = 4, S32 = 11, S33 = 16, S34 = 23;
  const S41 = 6, S42 = 10, S43 = 15, S44 = 21;
  
  message = utf8Encode(message);
  x = convertToWordArray(message);
  a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;
  
  for (k = 0; k < x.length; k += 16) {
    AA = a; BB = b; CC = c; DD = d;
    a = ff(a, b, c, d, x[k + 0], S11, 0xD76AA478);
    d = ff(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
    c = ff(c, d, a, b, x[k + 2], S13, 0x242070DB);
    b = ff(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
    a = ff(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
    d = ff(d, a, b, c, x[k + 5], S12, 0x4787C62A);
    c = ff(c, d, a, b, x[k + 6], S13, 0xA8304613);
    b = ff(b, c, d, a, x[k + 7], S14, 0xFD469501);
    a = ff(a, b, c, d, x[k + 8], S11, 0x698098D8);
    d = ff(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
    c = ff(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
    b = ff(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
    a = ff(a, b, c, d, x[k + 12], S11, 0x6B901122);
    d = ff(d, a, b, c, x[k + 13], S12, 0xFD987193);
    c = ff(c, d, a, b, x[k + 14], S13, 0xA679438E);
    b = ff(b, c, d, a, x[k + 15], S14, 0x49B40821);
    a = gg(a, b, c, d, x[k + 1], S21, 0xF61E2562);
    d = gg(d, a, b, c, x[k + 6], S22, 0xC040B340);
    c = gg(c, d, a, b, x[k + 11], S23, 0x265E5A51);
    b = gg(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
    a = gg(a, b, c, d, x[k + 5], S21, 0xD62F105D);
    d = gg(d, a, b, c, x[k + 10], S22, 0x2441453);
    c = gg(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
    b = gg(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
    a = gg(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
    d = gg(d, a, b, c, x[k + 14], S22, 0xC33707D6);
    c = gg(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
    b = gg(b, c, d, a, x[k + 8], S24, 0x455A14ED);
    a = gg(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
    d = gg(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
    c = gg(c, d, a, b, x[k + 7], S23, 0x676F02D9);
    b = gg(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
    a = hh(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
    d = hh(d, a, b, c, x[k + 8], S32, 0x8771F681);
    c = hh(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
    b = hh(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
    a = hh(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
    d = hh(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
    c = hh(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
    b = hh(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
    a = hh(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
    d = hh(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
    c = hh(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
    b = hh(b, c, d, a, x[k + 6], S34, 0x4881D05);
    a = hh(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
    d = hh(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
    c = hh(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
    b = hh(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
    a = ii(a, b, c, d, x[k + 0], S41, 0xF4292244);
    d = ii(d, a, b, c, x[k + 7], S42, 0x432AFF97);
    c = ii(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
    b = ii(b, c, d, a, x[k + 5], S44, 0xFC93A039);
    a = ii(a, b, c, d, x[k + 12], S41, 0x655B59C3);
    d = ii(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
    c = ii(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
    b = ii(b, c, d, a, x[k + 1], S44, 0x85845DD1);
    a = ii(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
    d = ii(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
    c = ii(c, d, a, b, x[k + 6], S43, 0xA3014314);
    b = ii(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
    a = ii(a, b, c, d, x[k + 4], S41, 0xF7537E82);
    d = ii(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
    c = ii(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
    b = ii(b, c, d, a, x[k + 9], S44, 0xEB86D391);
    a = addUnsigned(a, AA);
    b = addUnsigned(b, BB);
    c = addUnsigned(c, CC);
    d = addUnsigned(d, DD);
  }
  
  const temp = wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);
  return temp.toLowerCase();
}

// ============================
// MEXC API PRONTO PARA PRODUÇÃO
// ============================
const MexcAPI = {

  async mexcSpotOrder(params, cookies, headers = {}) {
    const url = "https://www.mexc.com/api/platform/spot/v4/order/place";
    
    // Headers padrão + headers customizados
    const defaultHeaders = {
        "accept": "*/*",
        "content-type": "application/json",
        "origin": "https://www.mexc.com",
        "referer": "https://www.mexc.com/pt-PT/exchange/MX_USDT",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
        ...headers
    };

    // Converte cookies object para string
    const cookieString = Object.entries(cookies)
        .map(([key, value]) => `${key}=${value}`)
        .join('; ');

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                ...defaultHeaders,
                'Cookie': cookieString
            },
            body: JSON.stringify(params)
        });

        const responseText = await response.text();
        
        console.log(`Status: ${response.status}`);
        console.log(`Response: ${responseText}`);

        // Retorna resposta parseada ou erro
        if (response.ok) {
            try {
                return JSON.parse(responseText);
            } catch (e) {
                return { success: true, response: responseText };
            }
        } else {
            return { 
                error: true, 
                status: response.status, 
                response: responseText 
            };
        }

    } catch (error) {
        console.error(`Erro na requisição: ${error.message}`);
        return { 
            error: true, 
            message: error.message 
        };
    }
  },
  // ✅ DEBUG LIMPO PARA PRODUÇÃO
  get_signature(key, obj = '') {
    let date_now = String(Date.now());
    let g = md5(key + date_now).substring(7);
    let s = JSON.stringify(obj);
    let sign = md5(date_now + s + g);
    
    // Debug igual ao seu código Node.js
    console.log(date_now, s, g, sign);
    
    return { time: date_now, sign: sign };    
  },

  get_headers(key, sign) {
    return {
      accept: "*/*",
      "content-type": "application/json",
      "authorization": key,
      "x-mxc-nonce": sign.time,
      "x-mxc-sign": sign.sign,
    };   
  },

  async limit_order(key, params) {
    const required_params = ['symbol', 'side', 'vol', 'price'];
    
    for (let param of required_params) {
      if (!params[param]) {
        throw new Error(`Missing parameter for params: Required [symbol, side, vol, price]`);
      }
    }

    // ✅ DEFAULTS IGUAIS AO SEU CÓDIGO
    if (!params.type) params.type = "2";
    if (!params.openType) params.openType = 2;
    if (!params.priceProtect) params.priceProtect = "0";

    const sign = this.get_signature(key, params);
    
    try {
      const response = await fetch('https://futures.mexc.com/api/v1/private/order/submit', {
        method: 'POST',
        headers: this.get_headers(key, sign),
        body: JSON.stringify(params),
        credentials: 'include'
      });
      
      const data = await response.json();
      console.log('✅ Resposta MEXC limit_order:', data);
      return data;
    } catch (error) {
      console.error('❌ Erro na criação da ordem MEXC:', error);
      throw error;
    }
  },

  // ============================
  // 🆕 NOVOS MÉTODOS ADICIONADOS
  // ============================

  async cancel(key, params) {
    const required_params = ['orderIds'];
    
    for (let param of required_params) {
      if (!params[param]) {
        throw new Error(`Missing parameter for params: Required [orderIds]`);
      }
    }

    if (params.orderIds.length === 0) {
      return { success: true, message: 'No order to cancel!' };
    }

    const sign = this.get_signature(key, params.orderIds);
    
    try {
      const response = await fetch('https://futures.mexc.com/api/v1/private/order/cancel', {
        method: 'POST',
        headers: this.get_headers(key, sign),
        body: JSON.stringify(params.orderIds),
        credentials: 'include'
      });
      
      const data = await response.json();
      console.log('✅ Resposta MEXC cancel:', data);
      return data;
    } catch (error) {
      console.error('❌ Erro no cancelamento MEXC:', error);
      throw error;
    }
  },

  async get_limit_pending_orders(key, params) {
    const required_params = ['symbol'];
    
    for (let param of required_params) {
      if (!params[param]) {
        throw new Error(`Missing parameter for params: Required [symbol]`);
      }
    }

    let req_url = `https://futures.mexc.com/api/v1/private/order/list/open_orders/${params.symbol}?`;
    
    for (let paramKey of Object.keys(params)) {
      if (paramKey !== 'symbol') {
        req_url += `${paramKey}=${params[paramKey]}&`;
      }
    }

    const sign = this.get_signature(key);
    
    try {
      const response = await fetch(req_url, {
        method: 'GET',
        headers: this.get_headers(key, sign),
        credentials: 'include'
      });
      
      const data = await response.json();
      console.log('✅ Resposta MEXC get_limit_pending_orders:', data);
      return data;
    } catch (error) {
      console.error('❌ Erro ao buscar ordens pendentes MEXC:', error);
      throw error;
    }
  },

  async get_trigger_pending_orders(key, params) {
    if (!params.states) params.states = "1";

    let req_url = `https://futures.mexc.com/api/v1/private/planorder/list/orders?`;
    
    for (let paramKey of Object.keys(params)) {
      req_url += `${paramKey}=${params[paramKey]}&`;
    }

    const sign = this.get_signature(key);
    
    try {
      const response = await fetch(req_url, {
        method: 'GET',
        headers: this.get_headers(key, sign),
        credentials: 'include'
      });
      
      const data = await response.json();
      console.log('✅ Resposta MEXC get_trigger_pending_orders:', data);
      return data;
    } catch (error) {
      console.error('❌ Erro ao buscar ordens trigger MEXC:', error);
      throw error;
    }
  },

  async cancel_trigger(key, params) {
    const required_params = ['orders'];
    
    for (let param of required_params) {
      if (!params[param]) {
        throw new Error(`Missing parameter for params: Required [orders]`);
      }
    }

    if (params.orders.length === 0) {
      return { success: true, message: 'No trigger order to cancel!' };
    }

    const sign = this.get_signature(key, params.orders);
    
    try {
      const response = await fetch('https://futures.mexc.com/api/v1/private/planorder/cancel', {
        method: 'POST',
        headers: this.get_headers(key, sign),
        body: JSON.stringify(params.orders),
        credentials: 'include'
      });
      
      const data = await response.json();
      console.log('✅ Resposta MEXC cancel_trigger:', data);
      return data;
    } catch (error) {
      console.error('❌ Erro no cancelamento trigger MEXC:', error);
      throw error;
    }
  },

  async query_cancel(key, params) {
    const required_params = ['symbol'];
    
    for (let param of required_params) {
      if (!params[param]) {
        throw new Error(`Missing parameter for params: Required [symbol]`);
      }
    }

    const accepted_params = [
      'symbol', 'side', 'vol', 'price', 'orderId', 'leverage',
    ];

    for (let paramKey of Object.keys(params)) {
      if (!accepted_params.includes(paramKey)) {
        throw new Error(`Invalid parameter for params: Accepted [symbol, side, vol, createTime, price, orderId]`);
      }
    }

    const query_req = { symbol: params.symbol };
    
    try {
      let pending_orders = await this.get_limit_pending_orders(key, query_req);
      let trigger_orders = await this.get_trigger_pending_orders(key, query_req);
      
      let marked_orders = { limit: [], trigger: [] };

      for (let order of pending_orders.concat(trigger_orders)) {
        let match = true;
        
        for (let paramKey of Object.keys(params)) {
          if (paramKey === 'orderId') {
            let order_id = order.orderId ? 
              Math.floor(Number(order.orderId) / 1000) : 
              Math.floor(Number(order.id) / 1000);
            if (Math.floor(Number(params[paramKey]) / 1000) !== order_id) {
              match = false;
            }
          } else if (order[paramKey] && order[paramKey] !== params[paramKey]) {
            match = false;
          }
        }

        if (match) {
          if (order.orderId) {
            marked_orders.limit.push(order.orderId);
          } else {
            marked_orders.trigger.push({ symbol: params.symbol, orderId: order.id });
          }
        }
      }

      if (marked_orders.limit.length === 0 && marked_orders.trigger.length === 0) {
        return { success: true, message: 'No matched orders!' };
      }

      const limit_response = marked_orders.limit.length > 0 ? 
        await this.cancel(key, { orderIds: marked_orders.limit }) : 
        { success: true, message: 'No limit orders to cancel' };
        
      const trigger_response = marked_orders.trigger.length > 0 ? 
        await this.cancel_trigger(key, { orders: marked_orders.trigger }) : 
        { success: true, message: 'No trigger orders to cancel' };

      return { success: true, limit_response, trigger_response };

    } catch (error) {
      console.error('❌ Erro no query_cancel MEXC:', error);
      throw error;
    }
  }
};