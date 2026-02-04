// Content script para interagir com a página do Google Flow

let currentBatchFolder = 'LaCasaDark_Scenes';
let currentSceneNumber = 1;
let isMonitoringVideo = false;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'INJECT_PROMPT') {
    injectPrompt(message.prompt);
    sendResponse({ success: true });
  }
  
  if (message.type === 'INJECT_BATCH_PROMPT') {
    currentBatchFolder = message.folderName || 'LaCasaDark_Scenes';
    injectPrompt(message.prompt);
    startVideoMonitor();
    sendResponse({ success: true });
  }
  
  return true;
});

function injectPrompt(prompt) {
  // Tentar encontrar o campo de texto do Google Flow
  const textareas = document.querySelectorAll('textarea');
  const inputs = document.querySelectorAll('input[type="text"]');
  
  // Procurar campo de prompt
  let promptField = null;
  
  // Tentar textareas primeiro
  for (const textarea of textareas) {
    if (textarea.placeholder?.toLowerCase().includes('prompt') ||
        textarea.placeholder?.toLowerCase().includes('describe') ||
        textarea.getAttribute('aria-label')?.toLowerCase().includes('prompt')) {
      promptField = textarea;
      break;
    }
  }
  
  // Se não encontrou, pegar o primeiro textarea visível
  if (!promptField && textareas.length > 0) {
    promptField = textareas[0];
  }
  
  if (promptField) {
    // Inserir o prompt
    promptField.value = prompt;
    promptField.dispatchEvent(new Event('input', { bubbles: true }));
    promptField.dispatchEvent(new Event('change', { bubbles: true }));
    
    // Focus no campo
    promptField.focus();
    
    // Tentar clicar no botão de enviar/gerar
    setTimeout(() => {
      const submitButtons = document.querySelectorAll('button');
      for (const button of submitButtons) {
        const text = button.textContent?.toLowerCase() || '';
        const ariaLabel = button.getAttribute('aria-label')?.toLowerCase() || '';
        
        if (text.includes('generate') || text.includes('create') || 
            text.includes('gerar') || text.includes('enviar') ||
            ariaLabel.includes('generate') || ariaLabel.includes('submit')) {
          button.click();
          showNotification('Prompt enviado! Gerando vídeo...');
          break;
        }
      }
    }, 500);
    
    showNotification('Prompt inserido com sucesso!');
  } else {
    showNotification('Campo de prompt não encontrado', 'error');
  }
}

function startVideoMonitor() {
  if (isMonitoringVideo) return;
  isMonitoringVideo = true;
  
  showNotification('Monitorando geração de vídeo...');
  
  // Observer para detectar quando o vídeo aparecer
  const observer = new MutationObserver((mutations) => {
    // Procurar por elementos de vídeo ou links de download
    const videos = document.querySelectorAll('video');
    const downloadLinks = document.querySelectorAll('a[download], a[href*=".mp4"], button[aria-label*="download"]');
    
    for (const video of videos) {
      if (video.src && !video.dataset.downloaded) {
        video.dataset.downloaded = 'true';
        downloadVideo(video.src);
        return;
      }
    }
    
    // Também verificar blobs de vídeo
    for (const video of videos) {
      if (video.src?.startsWith('blob:') && !video.dataset.downloaded) {
        video.dataset.downloaded = 'true';
        downloadBlobVideo(video);
        return;
      }
    }
    
    // Verificar botões de download
    for (const link of downloadLinks) {
      if (!link.dataset.autoClicked) {
        link.dataset.autoClicked = 'true';
        
        // Se for um link com href, baixar diretamente
        if (link.href && link.href.includes('.mp4')) {
          downloadVideo(link.href);
          return;
        }
        
        // Se for botão de download, clicar e monitorar
        if (link.tagName === 'BUTTON') {
          link.click();
          showNotification('Download iniciado automaticamente!');
        }
      }
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['src', 'href']
  });
  
  // Timeout de segurança - parar de monitorar após 5 minutos
  setTimeout(() => {
    observer.disconnect();
    isMonitoringVideo = false;
  }, 5 * 60 * 1000);
}

function downloadVideo(url) {
  const sceneNum = String(currentSceneNumber).padStart(2, '0');
  const filename = `${currentBatchFolder}/cena-${sceneNum}.mp4`;
  
  // Usar a API de downloads do Chrome
  chrome.runtime.sendMessage({
    type: 'DOWNLOAD_VIDEO',
    url: url,
    filename: filename
  }, (response) => {
    if (response?.success) {
      showNotification(`Cena ${sceneNum} baixada!`, 'success');
      currentSceneNumber++;
      
      // Notificar o side panel
      window.postMessage({
        type: 'VIDEO_COMPLETED',
        videoUrl: url,
        sceneNumber: currentSceneNumber - 1
      }, '*');
      
      isMonitoringVideo = false;
    } else {
      showNotification('Erro ao baixar vídeo', 'error');
      window.postMessage({
        type: 'VIDEO_ERROR',
        error: response?.error || 'Erro desconhecido'
      }, '*');
    }
  });
}

async function downloadBlobVideo(videoElement) {
  try {
    const sceneNum = String(currentSceneNumber).padStart(2, '0');
    
    // Tentar capturar o vídeo usando MediaRecorder
    // Isso é uma abordagem alternativa para blobs
    const response = await fetch(videoElement.src);
    const blob = await response.blob();
    
    // Criar URL de download
    const url = URL.createObjectURL(blob);
    
    // Criar link de download
    const a = document.createElement('a');
    a.href = url;
    a.download = `cena-${sceneNum}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification(`Cena ${sceneNum} baixada!`, 'success');
    currentSceneNumber++;
    
    window.postMessage({
      type: 'VIDEO_COMPLETED',
      videoUrl: videoElement.src,
      sceneNumber: currentSceneNumber - 1
    }, '*');
    
    isMonitoringVideo = false;
  } catch (error) {
    console.error('Erro ao baixar blob video:', error);
    showNotification('Erro ao baixar vídeo', 'error');
    window.postMessage({
      type: 'VIDEO_ERROR',
      error: error.message
    }, '*');
  }
}

function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 24px;
    background: ${type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#3b82f6'};
    color: white;
    border-radius: 8px;
    font-family: Inter, sans-serif;
    font-size: 14px;
    z-index: 999999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    animation: slideIn 0.3s ease-out;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-in forwards';
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

// Injetar estilos de animação
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);
