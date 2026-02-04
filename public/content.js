// Content script para interagir com a página do Google Flow/Labs
// Esta extensão NÃO gera vídeos - apenas envia prompts para o Flow e baixa os resultados

let currentBatchFolder = 'LaCasaDark_Scenes';
let currentSceneNumber = 1;
let isMonitoringVideo = false;
let videoObserver = null;

// Comunicação com o side panel via chrome.runtime
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[LaCasaDark] Mensagem recebida:', message.type);
  
  if (message.type === 'INJECT_PROMPT') {
    const result = injectPromptToFlow(message.prompt);
    sendResponse(result);
  }
  
  if (message.type === 'INJECT_BATCH_PROMPT') {
    currentBatchFolder = message.folderName || 'LaCasaDark_Scenes';
    currentSceneNumber = message.sceneNumber || 1;
    
    const result = injectPromptToFlow(message.prompt);
    if (result.success) {
      startVideoMonitor(message.sceneNumber);
    }
    sendResponse(result);
  }
  
  if (message.type === 'CHECK_PAGE_READY') {
    const promptField = findPromptField();
    sendResponse({ ready: !!promptField });
  }
  
  return true;
});

// Encontrar o campo de prompt no Google Flow/Labs
function findPromptField() {
  // Seletores específicos para Google Flow / AI Test Kitchen / Labs
  const selectors = [
    'textarea[placeholder*="Describe"]',
    'textarea[placeholder*="describe"]',
    'textarea[placeholder*="prompt"]',
    'textarea[placeholder*="Prompt"]',
    'textarea[aria-label*="prompt"]',
    'textarea[aria-label*="Prompt"]',
    'textarea[aria-label*="describe"]',
    'textarea[data-testid*="prompt"]',
    // Seletores genéricos como fallback
    'div[contenteditable="true"]',
    'textarea',
  ];
  
  for (const selector of selectors) {
    const elements = document.querySelectorAll(selector);
    for (const el of elements) {
      // Verificar se é visível
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        return el;
      }
    }
  }
  
  return null;
}

// Encontrar o botão de gerar/criar
function findGenerateButton() {
  const buttons = document.querySelectorAll('button');
  
  for (const button of buttons) {
    const text = (button.textContent || '').toLowerCase();
    const ariaLabel = (button.getAttribute('aria-label') || '').toLowerCase();
    const title = (button.getAttribute('title') || '').toLowerCase();
    
    // Palavras-chave para botão de geração
    const keywords = ['generate', 'create', 'make', 'go', 'submit', 'send', 'gerar', 'criar'];
    
    for (const keyword of keywords) {
      if (text.includes(keyword) || ariaLabel.includes(keyword) || title.includes(keyword)) {
        // Verificar se está visível e habilitado
        const rect = button.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0 && !button.disabled) {
          return button;
        }
      }
    }
  }
  
  // Fallback: procurar botão com ícone de play ou seta
  for (const button of buttons) {
    const svg = button.querySelector('svg');
    if (svg) {
      const rect = button.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0 && !button.disabled) {
        // Verificar se parece um botão de submit (geralmente no final de um form)
        const parent = button.closest('form') || button.closest('[role="form"]');
        if (parent) {
          return button;
        }
      }
    }
  }
  
  return null;
}

// Injetar prompt no campo de texto do Flow
function injectPromptToFlow(prompt) {
  const promptField = findPromptField();
  
  if (!promptField) {
    showNotification('❌ Campo de prompt não encontrado. Navegue para a página de criação de vídeo.', 'error');
    return { success: false, error: 'Campo de prompt não encontrado' };
  }
  
  try {
    // Limpar campo existente
    if (promptField.tagName === 'TEXTAREA' || promptField.tagName === 'INPUT') {
      promptField.value = '';
      promptField.value = prompt;
    } else if (promptField.contentEditable === 'true') {
      promptField.innerHTML = '';
      promptField.textContent = prompt;
    }
    
    // Disparar eventos para React/Angular detectar a mudança
    promptField.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    promptField.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
    promptField.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'a' }));
    promptField.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'a' }));
    
    // Focus no campo
    promptField.focus();
    
    showNotification('✅ Prompt inserido no Flow!', 'success');
    
    // Tentar clicar no botão de gerar após um delay
    setTimeout(() => {
      const generateButton = findGenerateButton();
      if (generateButton) {
        generateButton.click();
        showNotification('🚀 Gerando vídeo no Flow...', 'info');
        console.log('[LaCasaDark] Botão de gerar clicado');
      } else {
        showNotification('⚠️ Clique manualmente em "Generate" para iniciar', 'warning');
        console.log('[LaCasaDark] Botão de gerar não encontrado');
      }
    }, 800);
    
    return { success: true };
    
  } catch (error) {
    console.error('[LaCasaDark] Erro ao injetar prompt:', error);
    showNotification('❌ Erro ao inserir prompt', 'error');
    return { success: false, error: error.message };
  }
}

// Monitorar quando o vídeo estiver pronto
function startVideoMonitor(sceneNumber) {
  if (isMonitoringVideo) {
    console.log('[LaCasaDark] Já monitorando vídeo');
    return;
  }
  
  isMonitoringVideo = true;
  currentSceneNumber = sceneNumber || currentSceneNumber;
  
  console.log('[LaCasaDark] Iniciando monitoramento de vídeo para cena', currentSceneNumber);
  showNotification('👁️ Monitorando geração...', 'info');
  
  // Armazenar vídeos já existentes para não baixar duplicados
  const existingVideos = new Set();
  document.querySelectorAll('video').forEach(v => {
    if (v.src) existingVideos.add(v.src);
  });
  
  // Observer para detectar novos vídeos
  videoObserver = new MutationObserver((mutations) => {
    // Procurar por novos elementos de vídeo
    const videos = document.querySelectorAll('video');
    
    for (const video of videos) {
      const src = video.src || video.querySelector('source')?.src;
      
      if (src && !existingVideos.has(src) && !video.dataset.lcdownloaded) {
        console.log('[LaCasaDark] Novo vídeo detectado:', src);
        
        // Verificar se o vídeo está carregado
        if (video.readyState >= 2 || src.startsWith('blob:')) {
          video.dataset.lcdownloaded = 'true';
          existingVideos.add(src);
          
          // Esperar um pouco para garantir que está completo
          setTimeout(() => {
            handleVideoReady(video, src);
          }, 2000);
          return;
        }
        
        // Aguardar carregamento
        video.addEventListener('loadeddata', () => {
          if (!video.dataset.lcdownloaded) {
            video.dataset.lcdownloaded = 'true';
            existingVideos.add(src);
            handleVideoReady(video, src);
          }
        }, { once: true });
      }
    }
    
    // Também procurar por botões de download que aparecem
    const downloadButtons = document.querySelectorAll(
      'button[aria-label*="download" i], button[aria-label*="Download" i], ' +
      'a[download], a[href*=".mp4"]'
    );
    
    for (const btn of downloadButtons) {
      if (!btn.dataset.lcautoclick) {
        btn.dataset.lcautoclick = 'true';
        console.log('[LaCasaDark] Botão de download detectado');
        
        // Se for um link direto, usar
        if (btn.tagName === 'A' && btn.href) {
          handleVideoReady(null, btn.href);
          return;
        }
      }
    }
  });
  
  videoObserver.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['src', 'href']
  });
  
  // Timeout de 10 minutos
  setTimeout(() => {
    stopVideoMonitor();
    showNotification('⏱️ Timeout - monitoramento encerrado', 'warning');
  }, 10 * 60 * 1000);
}

function stopVideoMonitor() {
  if (videoObserver) {
    videoObserver.disconnect();
    videoObserver = null;
  }
  isMonitoringVideo = false;
}

async function handleVideoReady(videoElement, videoUrl) {
  console.log('[LaCasaDark] Vídeo pronto para download:', videoUrl);
  showNotification('🎬 Vídeo detectado! Baixando...', 'success');
  
  const sceneNum = String(currentSceneNumber).padStart(2, '0');
  
  try {
    let downloadUrl = videoUrl;
    
    // Se for blob, precisamos converter
    if (videoUrl.startsWith('blob:') && videoElement) {
      try {
        const response = await fetch(videoUrl);
        const blob = await response.blob();
        downloadUrl = URL.createObjectURL(blob);
        
        // Download direto via link
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `${currentBatchFolder}_cena-${sceneNum}.mp4`;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
        
        showNotification(`✅ Cena ${sceneNum} baixada!`, 'success');
        notifyPanelVideoComplete(videoUrl, currentSceneNumber);
        
      } catch (blobError) {
        console.error('[LaCasaDark] Erro ao baixar blob:', blobError);
        // Fallback: notificar usuário para baixar manualmente
        showNotification('⚠️ Clique no botão de download do Flow', 'warning');
      }
    } else {
      // URL normal - usar chrome.downloads via background
      chrome.runtime.sendMessage({
        type: 'DOWNLOAD_VIDEO',
        url: downloadUrl,
        filename: `${currentBatchFolder}/cena-${sceneNum}.mp4`
      }, (response) => {
        if (response?.success) {
          showNotification(`✅ Cena ${sceneNum} baixada!`, 'success');
          notifyPanelVideoComplete(videoUrl, currentSceneNumber);
        } else {
          showNotification('❌ Erro no download', 'error');
          notifyPanelVideoError(response?.error || 'Erro desconhecido');
        }
      });
    }
    
    currentSceneNumber++;
    stopVideoMonitor();
    
  } catch (error) {
    console.error('[LaCasaDark] Erro ao processar vídeo:', error);
    showNotification('❌ Erro ao baixar', 'error');
    notifyPanelVideoError(error.message);
  }
}

function notifyPanelVideoComplete(videoUrl, sceneNumber) {
  // Notificar via runtime message para o side panel
  chrome.runtime.sendMessage({
    type: 'VIDEO_COMPLETED',
    videoUrl,
    sceneNumber
  });
  
  // Também via postMessage (backup)
  window.postMessage({
    type: 'VIDEO_COMPLETED',
    videoUrl,
    sceneNumber
  }, '*');
}

function notifyPanelVideoError(error) {
  chrome.runtime.sendMessage({
    type: 'VIDEO_ERROR',
    error
  });
  
  window.postMessage({
    type: 'VIDEO_ERROR',
    error
  }, '*');
}

function showNotification(message, type = 'success') {
  // Remover notificações anteriores
  document.querySelectorAll('.lc-notification').forEach(n => n.remove());
  
  const colors = {
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6'
  };
  
  const notification = document.createElement('div');
  notification.className = 'lc-notification';
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 420px;
    padding: 12px 20px;
    background: ${colors[type] || colors.info};
    color: white;
    border-radius: 8px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    z-index: 999999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    animation: lcSlideIn 0.3s ease-out;
    max-width: 300px;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'lcSlideOut 0.3s ease-in forwards';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Injetar estilos de animação
const style = document.createElement('style');
style.textContent = `
  @keyframes lcSlideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes lcSlideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);

// Log de inicialização
console.log('[LaCasaDark CORE] Content script carregado em:', window.location.href);
