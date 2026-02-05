// Background service worker para La Casa Dark CORE
// Gerencia comunicação entre side panel e content scripts

 console.log('[La Casa Dark CORE] Background service worker v3.0 carregando...');
 
 // Estado das abas paralelas para sincronização
 const parallelTabsState = new Map(); // tabId -> { sessionId, status, progress, completedCount, totalCount }

// Abrir side panel quando clicar no ícone da extensão
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId });
});
 
 // Limpar estado quando aba é fechada
 chrome.tabs.onRemoved.addListener((tabId) => {
   if (parallelTabsState.has(tabId)) {
     const tabState = parallelTabsState.get(tabId);
     parallelTabsState.delete(tabId);
     
     // Notificar side panel que uma aba foi fechada
     chrome.runtime.sendMessage({
       type: 'PARALLEL_TAB_CLOSED',
       tabId,
       sessionId: tabState?.sessionId
     }).catch(() => {}); // Ignorar erro se side panel não estiver aberto
   }
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
     
     // Retransmitir para todas as janelas/side panels
     chrome.runtime.sendMessage({
       type: 'PROGRESS_THRESHOLD_REACHED',
       sceneNumber: message.sceneNumber,
       progress: message.progress,
       tabId: sender.tab?.id
     }).catch(() => {}); // Ignorar erro se side panel não estiver aberto
     
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
    
    // Atualizar estado da aba paralela se aplicável
    if (sender.tab?.id && parallelTabsState.has(sender.tab.id)) {
      const tabState = parallelTabsState.get(sender.tab.id);
      if (message.type === 'VIDEO_COMPLETED') {
        tabState.completedCount = (tabState.completedCount || 0) + 1;
        tabState.status = 'ready';
      }
      parallelTabsState.set(sender.tab.id, tabState);
    }
    
    // Retransmitir para side panel com info da aba
    chrome.runtime.sendMessage({
      ...message,
      tabId: sender.tab?.id
    }).catch(() => {});
    
    sendResponse({ received: true });
    return true;
  }
  
  // Registrar aba para sessão paralela
  if (message.type === 'REGISTER_PARALLEL_TAB') {
    parallelTabsState.set(message.tabId, {
      sessionId: message.sessionId,
      status: 'ready',
      progress: 0,
      completedCount: 0,
      totalCount: message.totalCount || 0
    });
    console.log('[Background] Aba registrada para sessão paralela:', message.tabId);
    sendResponse({ success: true });
    return true;
  }
  
  // Atualizar progresso de aba paralela
  if (message.type === 'PARALLEL_TAB_PROGRESS') {
    const tabId = sender.tab?.id || message.tabId;
    if (tabId && parallelTabsState.has(tabId)) {
      const tabState = parallelTabsState.get(tabId);
      tabState.progress = message.progress;
      tabState.status = message.status || tabState.status;
      if (message.completedCount !== undefined) {
        tabState.completedCount = message.completedCount;
      }
      parallelTabsState.set(tabId, tabState);
      
      // Retransmitir para side panel
      chrome.runtime.sendMessage({
        type: 'PARALLEL_TAB_PROGRESS_UPDATE',
        tabId,
        ...tabState
      }).catch(() => {});
    }
    sendResponse({ received: true });
    return true;
  }
  
  // Enviar prompt para aba específica (modo paralelo)
  if (message.type === 'INJECT_PARALLEL_PROMPT') {
    const targetTabId = message.tabId;
    
    if (targetTabId) {
      chrome.tabs.sendMessage(targetTabId, {
        type: 'INJECT_BATCH_PROMPT',
        prompt: message.prompt,
        folderName: message.folderName,
        sceneNumber: message.sceneNumber,
        settings: message.settings
      }, (response) => {
        if (chrome.runtime.lastError) {
          sendResponse({ success: false, error: chrome.runtime.lastError.message });
        } else {
          // Atualizar estado
          if (parallelTabsState.has(targetTabId)) {
            const tabState = parallelTabsState.get(targetTabId);
            tabState.status = 'processing';
            parallelTabsState.set(targetTabId, tabState);
          }
          sendResponse(response || { success: true });
        }
      });
    } else {
      sendResponse({ success: false, error: 'Tab ID não especificado' });
    }
    return true;
  }
  
  // Obter estado de todas as abas paralelas
  if (message.type === 'GET_PARALLEL_TABS_STATE') {
    const state = {};
    parallelTabsState.forEach((value, key) => {
      state[key] = value;
    });
    sendResponse({ success: true, state });
    return true;
  }
  
  // Abrir múltiplas abas para sessão paralela
  if (message.type === 'OPEN_PARALLEL_TABS') {
    const { count, sessionId, promptsPerTab } = message;
    const flowUrl = 'https://labs.google/fx/pt/tools/flow';
    const openedTabs = [];
    
    const openTab = async (index) => {
      return new Promise((resolve) => {
        chrome.tabs.create({ url: flowUrl, active: index === 0 }, (tab) => {
          if (tab?.id) {
            parallelTabsState.set(tab.id, {
              sessionId,
              status: 'opening',
              progress: 0,
              completedCount: 0,
              totalCount: promptsPerTab[index] || 0,
              tabIndex: index
            });
            openedTabs.push({ tabId: tab.id, index });
          }
          resolve(tab);
        });
      });
    };
    
    (async () => {
      for (let i = 0; i < count; i++) {
        await openTab(i);
        // Pequeno delay entre aberturas
        await new Promise(r => setTimeout(r, 300));
      }
      sendResponse({ success: true, tabs: openedTabs });
    })();
    
    return true;
  }
  
  return true;
});

 console.log('[La Casa Dark CORE] Background service worker v3.0 carregado');
