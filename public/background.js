// Background service worker para a extensão CharacterFlow

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

// Listener para mensagens do content script ou side panel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'COPY_TO_FLOW') {
    // Injetar prompt no Google Flow
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'INJECT_PROMPT',
          prompt: message.prompt
        });
      }
    });
    sendResponse({ success: true });
  }
  
  if (message.type === 'INJECT_BATCH_PROMPT') {
    // Injetar prompt de lote no Google Flow
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'INJECT_BATCH_PROMPT',
          prompt: message.prompt,
          folderName: message.folderName
        });
      }
    });
    sendResponse({ success: true });
  }
  
  if (message.type === 'DOWNLOAD_VIDEO') {
    // Baixar vídeo usando a API de downloads do Chrome
    chrome.downloads.download({
      url: message.url,
      filename: message.filename,
      saveAs: false
    }, (downloadId) => {
      if (chrome.runtime.lastError) {
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
      } else {
        sendResponse({ success: true, downloadId });
      }
    });
    return true; // Manter o canal aberto para resposta assíncrona
  }
  
  return true;
});
