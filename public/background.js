// Background service worker para La Casa Dark CORE
// Gerencia comunicação entre side panel e content scripts

 console.log('[La Casa Dark CORE] Background service worker v3.0 carregando...');

// Abrir side panel quando clicar no ícone da extensão
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId });
});

// Configurar side panel para abrir automaticamente em sites do Google Flow
chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
  if (!tab.url) return;
  
  const isGoogleFlow = tab.url.includes('aitestkitchen.withgoogle.com') || 
                       tab.url.includes('labs.google.com') ||
                       tab.url.includes('labs.google');
  
  if (isGoogleFlow) {
    await chrome.sidePanel.setOptions({
      tabId,
      path: 'index.html',
      enabled: true
    });
    console.log('[Background] Side panel habilitado para Google Flow');
  }
});

// Listener para mensagens do side panel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Background] Mensagem recebida:', message.type);
  
   // Ping para verificar se content script está ativo
   if (message.type === 'PING_CONTENT_SCRIPT') {
     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
       if (tabs[0]?.id) {
         chrome.tabs.sendMessage(tabs[0].id, { type: 'PING' }, (response) => {
           if (chrome.runtime.lastError) {
             sendResponse({ active: false, error: chrome.runtime.lastError.message });
           } else {
             sendResponse({ active: true, ...response });
           }
         });
       } else {
         sendResponse({ active: false, error: 'No active tab' });
       }
     });
     return true;
   }
 
  // Mensagem do content script que está pronto
  if (message.type === 'CONTENT_SCRIPT_READY') {
    console.log('[Background] Content script pronto em:', message.url);
     // Notificar todas as janelas/side panels
     chrome.runtime.sendMessage({ type: 'FLOW_PAGE_READY', url: message.url });
    sendResponse({ received: true });
    return true;
  }
  
   // Progresso atingiu 65%
   if (message.type === 'PROGRESS_THRESHOLD_REACHED') {
     console.log('[Background] Progresso 65% atingido, cena:', message.sceneNumber);
     chrome.runtime.sendMessage({
       type: 'PROGRESS_THRESHOLD_REACHED',
       sceneNumber: message.sceneNumber,
       progress: message.progress
     });
     sendResponse({ received: true });
     return true;
   }
 
  // Verificar se a página do Flow está pronta
  if (message.type === 'CHECK_PAGE_READY') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'CHECK_PAGE_READY' }, (response) => {
          if (chrome.runtime.lastError) {
            sendResponse({ ready: false, error: chrome.runtime.lastError.message });
          } else {
            sendResponse(response || { ready: false });
          }
        });
      } else {
        sendResponse({ ready: false, error: 'No active tab' });
      }
    });
    return true;
  }
  
  // Mensagem do side panel para injetar prompt simples
  if (message.type === 'COPY_TO_FLOW' || message.type === 'INJECT_PROMPT') {
    // Enviar para o content script da aba ativa
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'INJECT_PROMPT',
          prompt: message.prompt
        }, (response) => {
          sendResponse(response || { success: false, error: 'Sem resposta do content script' });
        });
      } else {
        sendResponse({ success: false, error: 'Nenhuma aba ativa encontrada' });
      }
    });
    return true; // Manter canal aberto para resposta assíncrona
  }
  
  // Mensagem do side panel para injetar prompt em lote
  if (message.type === 'INJECT_BATCH_PROMPT') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'INJECT_BATCH_PROMPT',
          prompt: message.prompt,
          folderName: message.folderName,
           sceneNumber: message.sceneNumber,
           settings: message.settings
        }, (response) => {
          sendResponse(response || { success: false, error: 'Sem resposta do content script' });
        });
      } else {
        sendResponse({ success: false, error: 'Nenhuma aba ativa encontrada' });
      }
    });
    return true;
  }
  
  // Mensagem do content script para baixar vídeo
  if (message.type === 'DOWNLOAD_VIDEO') {
    chrome.downloads.download({
      url: message.url,
      filename: message.filename,
      saveAs: false
    }, (downloadId) => {
      if (chrome.runtime.lastError) {
        console.error('[Background] Erro no download:', chrome.runtime.lastError);
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
      } else {
        console.log('[Background] Download iniciado:', downloadId);
        sendResponse({ success: true, downloadId });
      }
    });
    return true;
  }
  
  // Mensagens de status do content script - retransmitir para side panel
  if (message.type === 'VIDEO_COMPLETED' || message.type === 'VIDEO_ERROR') {
    console.log('[Background] Retransmitindo evento:', message.type);
    // Enviar para o side panel via postMessage
    // O side panel escuta eventos do window
    sendResponse({ received: true });
    return true;
  }
  
  return true;
});

 console.log('[La Casa Dark CORE] Background service worker v3.0 carregado');
