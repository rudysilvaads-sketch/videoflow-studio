// Content script para La Casa Dark CORE
// Interage com Google Flow / Labs para injetar prompts e baixar vídeos

console.log('[LaCasaDark] Content script carregando...');

let currentBatchFolder = 'LaCasaDark_Scenes';
let currentSceneNumber = 1;
let isMonitoringVideo = false;
let videoObserver = null;

// Comunicação com o background/side panel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[LaCasaDark] Mensagem recebida:', message.type, message);
  
  if (message.type === 'INJECT_PROMPT') {
    const result = injectPromptToFlow(message.prompt);
    sendResponse(result);
    return true;
  }
  
  if (message.type === 'INJECT_BATCH_PROMPT') {
    currentBatchFolder = message.folderName || 'LaCasaDark_Scenes';
    currentSceneNumber = message.sceneNumber || 1;
    
    const result = injectPromptToFlow(message.prompt);
    if (result.success) {
      startVideoMonitor(message.sceneNumber);
    }
    sendResponse(result);
    return true;
  }
  
  if (message.type === 'CHECK_PAGE_READY') {
    const promptField = findPromptField();
    sendResponse({ ready: !!promptField, found: promptField ? 'yes' : 'no' });
    return true;
  }
  
  return true;
});

// Encontrar o campo de prompt no Google Flow/Labs
function findPromptField() {
  console.log('[LaCasaDark] Procurando campo de prompt...');
  
  // Seletores específicos para Google Flow / Labs - baseado no screenshot
  // O campo tem placeholder "Crie um vídeo usando texto..."
  const specificSelectors = [
    // Textareas com placeholders específicos do Flow
    'textarea[placeholder*="Crie um vídeo"]',
    'textarea[placeholder*="Create a video"]',
    'textarea[placeholder*="vídeo usando texto"]',
    'textarea[placeholder*="video using text"]',
    'textarea[placeholder*="Describe"]',
    'textarea[placeholder*="describe"]',
    // Divs contenteditable (comum em apps React/Angular modernos)
    'div[contenteditable="true"][data-placeholder]',
    'div[contenteditable="true"]',
    // Inputs genéricos
    'input[type="text"][placeholder*="video"]',
    'input[type="text"][placeholder*="vídeo"]',
  ];
  
  for (const selector of specificSelectors) {
    const elements = document.querySelectorAll(selector);
    for (const el of elements) {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      // Verificar se é visível
      if (rect.width > 50 && rect.height > 20 && style.display !== 'none' && style.visibility !== 'hidden') {
        console.log('[LaCasaDark] Campo encontrado:', selector, el);
        return el;
      }
    }
  }
  
  // Fallback: procurar qualquer textarea visível
  const textareas = document.querySelectorAll('textarea');
  for (const textarea of textareas) {
    const rect = textarea.getBoundingClientRect();
    if (rect.width > 100 && rect.height > 30) {
      console.log('[LaCasaDark] Textarea fallback encontrado:', textarea);
      return textarea;
    }
  }
  
  // Último fallback: divs editáveis
  const editables = document.querySelectorAll('[contenteditable="true"]');
  for (const el of editables) {
    const rect = el.getBoundingClientRect();
    if (rect.width > 100 && rect.height > 20) {
      console.log('[LaCasaDark] Contenteditable fallback:', el);
      return el;
    }
  }
  
  console.log('[LaCasaDark] Nenhum campo encontrado!');
  return null;
}

// Encontrar o botão de enviar/gerar
function findSubmitButton() {
  console.log('[LaCasaDark] Procurando botão de enviar...');
  
  // Procurar botão com ícone de seta (comum no Flow)
  const buttons = document.querySelectorAll('button');
  
  for (const button of buttons) {
    const rect = button.getBoundingClientRect();
    if (rect.width < 10 || rect.height < 10) continue;
    
    // Verificar texto/aria-label
    const text = (button.textContent || '').toLowerCase().trim();
    const ariaLabel = (button.getAttribute('aria-label') || '').toLowerCase();
    const title = (button.getAttribute('title') || '').toLowerCase();
    
    // Botões de submit comuns
    const submitKeywords = ['submit', 'send', 'go', 'generate', 'create', 'enviar', 'gerar', 'criar'];
    
    for (const keyword of submitKeywords) {
      if (text.includes(keyword) || ariaLabel.includes(keyword) || title.includes(keyword)) {
        if (!button.disabled) {
          console.log('[LaCasaDark] Botão encontrado por texto:', button);
          return button;
        }
      }
    }
    
    // Verificar se é um botão de seta (ícone SVG com path de seta)
    const svg = button.querySelector('svg');
    if (svg && !button.disabled) {
      // Verificar se está próximo ao campo de texto (geralmente à direita)
      const promptField = findPromptField();
      if (promptField) {
        const fieldRect = promptField.getBoundingClientRect();
        // Botão de submit geralmente está à direita ou abaixo do campo
        if (rect.left > fieldRect.left && Math.abs(rect.top - fieldRect.top) < 100) {
          console.log('[LaCasaDark] Botão de seta encontrado:', button);
          return button;
        }
      }
    }
  }
  
  console.log('[LaCasaDark] Botão de enviar não encontrado');
  return null;
}

// Injetar prompt no campo de texto do Flow
function injectPromptToFlow(prompt) {
  console.log('[LaCasaDark] Tentando injetar prompt:', prompt.substring(0, 50) + '...');
  
  const promptField = findPromptField();
  
  if (!promptField) {
    showNotification('❌ Campo de prompt não encontrado!', 'error');
    return { success: false, error: 'Campo de prompt não encontrado' };
  }
  
  try {
    // Focar no campo primeiro
    promptField.focus();
    
    // Determinar o tipo de campo
    if (promptField.tagName === 'TEXTAREA' || promptField.tagName === 'INPUT') {
      // Campo de input padrão
      promptField.value = prompt;
      
      // Disparar eventos para frameworks React/Angular
      const inputEvent = new Event('input', { bubbles: true, cancelable: true });
      promptField.dispatchEvent(inputEvent);
      
      const changeEvent = new Event('change', { bubbles: true, cancelable: true });
      promptField.dispatchEvent(changeEvent);
      
      // Simular digitação para alguns frameworks
      promptField.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'a', code: 'KeyA' }));
      promptField.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'a', code: 'KeyA' }));
      
    } else if (promptField.contentEditable === 'true') {
      // Campo contenteditable
      promptField.innerHTML = '';
      promptField.textContent = prompt;
      
      // Disparar eventos
      promptField.dispatchEvent(new Event('input', { bubbles: true }));
      promptField.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    console.log('[LaCasaDark] Prompt inserido com sucesso!');
    showNotification('✅ Prompt inserido!', 'success');
    
    // Tentar clicar no botão de enviar após um delay
    setTimeout(() => {
      const submitButton = findSubmitButton();
      if (submitButton) {
        console.log('[LaCasaDark] Clicando no botão de enviar...');
        submitButton.click();
        showNotification('🚀 Enviando para o Flow...', 'info');
      } else {
        showNotification('⚠️ Clique na seta → para enviar', 'warning');
      }
    }, 500);
    
    return { success: true };
    
  } catch (error) {
    console.error('[LaCasaDark] Erro ao injetar prompt:', error);
    showNotification('❌ Erro: ' + error.message, 'error');
    return { success: false, error: error.message };
  }
}

// Monitorar quando o vídeo estiver pronto
function startVideoMonitor(sceneNumber) {
  if (isMonitoringVideo) {
    console.log('[LaCasaDark] Já monitorando');
    return;
  }
  
  isMonitoringVideo = true;
  currentSceneNumber = sceneNumber || currentSceneNumber;
  
  console.log('[LaCasaDark] Monitorando vídeo para cena', currentSceneNumber);
  
  // Armazenar vídeos existentes
  const existingVideos = new Set();
  document.querySelectorAll('video').forEach(v => {
    if (v.src) existingVideos.add(v.src);
  });
  
  videoObserver = new MutationObserver(() => {
    const videos = document.querySelectorAll('video');
    
    for (const video of videos) {
      const src = video.src || video.querySelector('source')?.src;
      
      if (src && !existingVideos.has(src) && !video.dataset.lcdownloaded) {
        if (video.readyState >= 2 || src.startsWith('blob:')) {
          video.dataset.lcdownloaded = 'true';
          existingVideos.add(src);
          
          setTimeout(() => handleVideoReady(video, src), 2000);
          return;
        }
        
        video.addEventListener('loadeddata', () => {
          if (!video.dataset.lcdownloaded) {
            video.dataset.lcdownloaded = 'true';
            existingVideos.add(src);
            handleVideoReady(video, src);
          }
        }, { once: true });
      }
    }
  });
  
  videoObserver.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['src']
  });
  
  // Timeout 10 minutos
  setTimeout(() => {
    stopVideoMonitor();
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
  console.log('[LaCasaDark] Vídeo pronto:', videoUrl);
  showNotification('🎬 Baixando vídeo...', 'success');
  
  const sceneNum = String(currentSceneNumber).padStart(2, '0');
  
  try {
    if (videoUrl.startsWith('blob:') && videoElement) {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${currentBatchFolder}_cena-${sceneNum}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
      
      showNotification(`✅ Cena ${sceneNum} baixada!`, 'success');
      notifyComplete(videoUrl);
    } else {
      chrome.runtime.sendMessage({
        type: 'DOWNLOAD_VIDEO',
        url: videoUrl,
        filename: `${currentBatchFolder}/cena-${sceneNum}.mp4`
      }, (response) => {
        if (response?.success) {
          showNotification(`✅ Cena ${sceneNum} baixada!`, 'success');
          notifyComplete(videoUrl);
        } else {
          showNotification('❌ Erro no download', 'error');
        }
      });
    }
    
    currentSceneNumber++;
    stopVideoMonitor();
    
  } catch (error) {
    console.error('[LaCasaDark] Erro:', error);
    showNotification('❌ Erro ao baixar', 'error');
  }
}

function notifyComplete(videoUrl) {
  chrome.runtime.sendMessage({
    type: 'VIDEO_COMPLETED',
    videoUrl,
    sceneNumber: currentSceneNumber
  });
}

function showNotification(message, type = 'info') {
  // Remover notificações anteriores
  document.querySelectorAll('.lc-dark-notification').forEach(n => n.remove());
  
  const colors = {
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#8b5cf6'
  };
  
  const notification = document.createElement('div');
  notification.className = 'lc-dark-notification';
  notification.innerHTML = `<span style="margin-right:8px">${message}</span>`;
  notification.style.cssText = `
    position: fixed;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%);
    padding: 12px 24px;
    background: ${colors[type] || colors.info};
    color: white;
    border-radius: 12px;
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 14px;
    font-weight: 600;
    z-index: 999999;
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    animation: lcFadeIn 0.3s ease-out;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.3s';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Estilos de animação
const style = document.createElement('style');
style.textContent = `
  @keyframes lcFadeIn {
    from { opacity: 0; transform: translateX(-50%) translateY(20px); }
    to { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
`;
document.head.appendChild(style);

// Log de inicialização
console.log('[LaCasaDark CORE] ✅ Content script ativo em:', window.location.href);

// Verificar se estamos na página certa
if (window.location.href.includes('labs.google') || window.location.href.includes('aitestkitchen')) {
  console.log('[LaCasaDark] Página do Flow detectada!');
  
  // Aguardar página carregar completamente
  setTimeout(() => {
    const field = findPromptField();
    if (field) {
      console.log('[LaCasaDark] ✅ Pronto para receber prompts');
    } else {
      console.log('[LaCasaDark] ⚠️ Campo de prompt não encontrado ainda');
    }
  }, 2000);
}
