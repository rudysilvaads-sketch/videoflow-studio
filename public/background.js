// Background service worker para La Casa Dark CORE
// Gerencia comunicação entre side panel e content scripts

// Abrir side panel quando clicar no ícone da extensão
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId });
});

// Configurar side panel para abrir automaticamente em sites do Google Flow
chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
  if (!tab.url) return;
  
  const isGoogleFlow = tab.url.includes('aitestkitchen.withgoogle.com') || 
                       tab.url.includes('labs.google');
  
  if (isGoogleFlow) {
    await chrome.sidePanel.setOptions({
      tabId,
      path: 'index.html',
      enabled: true
    });
  }
});

// Listener para mensagens do side panel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Background] Mensagem recebida:', message.type);
  
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
          sceneNumber: message.sceneNumber
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
    // Broadcast para todas as extensões (side panel vai receber)
    chrome.runtime.sendMessage(message).catch(() => {
      // Ignorar erro se side panel não estiver aberto
    });
    sendResponse({ received: true });
    return true;
  }
  
  return true;
});

console.log('[La Casa Dark CORE] Background service worker carregado');
