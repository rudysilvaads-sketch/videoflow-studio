// Content script para La Casa Dark CORE
// Interage com Google Flow / Labs para injetar prompts e baixar vídeos automaticamente

 console.log('[LaCasaDark] Content script v3.0 carregando...');

let currentBatchFolder = 'LaCasaDark_Scenes';
let currentSceneNumber = 1;
let isMonitoringVideo = false;
 let isMonitoringProgress = false;
let videoObserver = null;
 let progressObserver = null;
let processingInProgress = false;
 let lastProgressValue = 0;
 let progressThresholdReached = false;
let currentSettings = {
  model: 'veo-3.1-fast',
  ratio: '16:9',
  videosPerTask: 1,
};

 // Notificar side panel que o content script está pronto
 function notifyReady() {
   chrome.runtime.sendMessage({ 
     type: 'CONTENT_SCRIPT_READY', 
     url: window.location.href 
   });
 }
 
 // Notificar imediatamente e após delay
 notifyReady();
 setTimeout(notifyReady, 500);
 setTimeout(notifyReady, 1500);

// Comunicação com o background/side panel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[LaCasaDark] Mensagem recebida:', message.type, message);
  
   if (message.type === 'PING') {
     sendResponse({ pong: true, url: window.location.href });
     return true;
   }
 
  if (message.type === 'INJECT_PROMPT') {
    injectPromptToFlow(message.prompt)
      .then((result) => sendResponse(result))
      .catch((error) => {
        console.error('[LaCasaDark] Erro no INJECT_PROMPT:', error);
        sendResponse({ success: false, error: error?.message || String(error) });
      });
    return true;
  }
  
  if (message.type === 'INJECT_BATCH_PROMPT') {
    currentBatchFolder = message.folderName || 'LaCasaDark_Scenes';
    currentSceneNumber = message.sceneNumber || 1;
    
    // Atualizar settings se enviadas
    if (message.settings) {
      currentSettings = { ...currentSettings, ...message.settings };
    }
    
    // Verificar se já está processando
    if (processingInProgress) {
      console.log('[LaCasaDark] Aguardando processamento anterior...');
      sendResponse({ success: false, error: 'Processing in progress' });
      return true;
    }
    
    processingInProgress = true;
    
    // Iniciar fluxo automático
    executeAutomation(message.prompt, message.sceneNumber)
      .then(result => {
        processingInProgress = false;
        sendResponse(result);
      })
      .catch(error => {
        processingInProgress = false;
        console.error('[LaCasaDark] Erro:', error);
        sendResponse({ success: false, error: error.message });
      });
    
    return true;
  }
  
  if (message.type === 'CHECK_PAGE_READY') {
    const promptField = findPromptField();
     sendResponse({ ready: true, fieldFound: !!promptField, url: window.location.href });
    return true;
  }
  
   if (message.type === 'REQUEST_NEXT_PROMPT') {
     console.log('[LaCasaDark] Pronto para próximo prompt');
     progressThresholdReached = false;
     sendResponse({ ready: true });
     return true;
   }
 
  if (message.type === 'UPDATE_SETTINGS') {
    currentSettings = { ...currentSettings, ...message.settings };
    console.log('[LaCasaDark] Settings atualizadas:', currentSettings);
    sendResponse({ success: true });
    return true;
  }
  
  return true;
});

// Executa automação completa
async function executeAutomation(prompt, sceneNumber) {
  console.log('[LaCasaDark] === INICIANDO AUTOMAÇÃO ===');
  console.log('[LaCasaDark] Cena:', sceneNumber);
  console.log('[LaCasaDark] Prompt:', prompt.substring(0, 100) + '...');
  
  showNotification('🔄 Iniciando automação...', 'info');
  
  try {
    // Passo 1: Verificar se estamos na página correta
    const isFlowPage = window.location.href.includes('labs.google') || 
                       window.location.href.includes('aitestkitchen');
    
    if (!isFlowPage) {
      showNotification('❌ Não estamos na página do Google Flow!', 'error');
      return { success: false, error: 'Not on Google Flow page' };
    }
    
    // Passo 2: Clicar no botão "Novo projeto" se necessário
    // Primeiro, tentar encontrar o campo diretamente (pode já estar disponível)
    let promptField = await waitForPromptField(3000);
    
    // Se não encontrou, tentar criar novo projeto
    if (!promptField) {
      console.log('[LaCasaDark] Campo não encontrado, tentando novo projeto...');
      await clickNewProjectButton();
      await delay(2000);
      promptField = await waitForPromptField(8000);
    }
    
    if (!promptField) {
      showNotification('❌ Campo de prompt não encontrado!', 'error');
      return { success: false, error: 'Prompt field not found' };
    }
    
    // Passo 3: Inserir o prompt
    await insertPrompt(promptField, prompt);
    showNotification('✅ Prompt inserido!', 'success');
    await delay(500);
    
    // Passo 5: Clicar no botão de enviar
    const submitted = await clickSubmitButton();
    
    if (submitted) {
      showNotification('🚀 Gerando vídeo...', 'info');
      startVideoMonitor(sceneNumber);
      return { success: true };
    } else {
      showNotification('⚠️ Clique manualmente no botão de enviar', 'warning');
      return { success: true, warning: 'Submit button not clicked' };
    }
    
  } catch (error) {
    console.error('[LaCasaDark] Erro na automação:', error);
    showNotification('❌ Erro: ' + error.message, 'error');
    return { success: false, error: error.message };
  }
}

// Clicar no botão de novo projeto
async function clickNewProjectButton() {
  console.log('[LaCasaDark] Procurando botão de novo projeto...');
  
  // Lista de seletores possíveis baseado na interface do Flow
  const selectors = [
    // Botões com texto
    'button:has-text("Novo projeto")',
    'button:has-text("New project")',
    // Botões com + no início
    'button[aria-label*="novo"]',
    'button[aria-label*="new"]',
    'button[aria-label*="add"]',
    'button[aria-label*="criar"]',
    'button[aria-label*="create"]',
  ];
  
  // Método 1: Busca por texto no botão
  const buttons = document.querySelectorAll('button, div[role="button"], a');
  
  for (const btn of buttons) {
    const text = (btn.textContent || '').toLowerCase().trim();
    
    if (
      text.includes('novo projeto') || 
      text.includes('new project') ||
      text === '+ novo projeto' ||
      text === '+ new project'
    ) {
      console.log('[LaCasaDark] Botão encontrado:', text);
      showNotification('📁 Criando novo projeto...', 'info');
      btn.click();
      return true;
    }
  }
  
  // Método 2: Buscar pelo ícone + em cards/botões grandes
  const cards = document.querySelectorAll('[class*="card"], [class*="grid"] > div');
  for (const card of cards) {
    const text = (card.textContent || '').toLowerCase();
    if (text.includes('novo projeto') || text.includes('new project')) {
      const clickable = card.querySelector('button') || card;
      console.log('[LaCasaDark] Card encontrado:', text.substring(0, 50));
      clickable.click();
      return true;
    }
  }
  
  console.log('[LaCasaDark] Botão novo projeto não encontrado - pode já estar na página de criação');
  return false;
}

// Aguardar campo de prompt aparecer
async function waitForPromptField(timeout = 5000) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const field = findPromptField();
    if (field) {
      console.log('[LaCasaDark] Campo encontrado após', Date.now() - startTime, 'ms');
      return field;
    }
    await delay(200);
  }
  
  console.log('[LaCasaDark] Timeout aguardando campo de prompt');
  return null;
}

// Inserir prompt no campo
async function insertPrompt(field, prompt) {
  console.log('[LaCasaDark] Inserindo prompt...');
  
  // Focar no campo
  field.focus();
  field.click();
  await delay(100);
  
  // Limpar conteúdo existente
  if (field.tagName === 'TEXTAREA' || field.tagName === 'INPUT') {
    field.value = '';
    field.value = prompt;
    
    // Disparar eventos para React/Angular
    field.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    field.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    
    // Simular keypress para frameworks mais complexos
    const inputEvent = new InputEvent('input', {
      bubbles: true,
      cancelable: true,
      inputType: 'insertText',
      data: prompt
    });
    field.dispatchEvent(inputEvent);
    
  } else if (field.contentEditable === 'true') {
    // Para divs editáveis
    field.innerHTML = '';
    field.textContent = prompt;
    field.dispatchEvent(new Event('input', { bubbles: true }));
  }
  
  console.log('[LaCasaDark] Prompt inserido com sucesso');
}

// Clicar no botão de enviar
async function clickSubmitButton() {
  console.log('[LaCasaDark] Procurando botão de enviar...');
  await delay(300);
  
  const button = findSubmitButton();
  
  if (button && !button.disabled) {
    console.log('[LaCasaDark] Clicando no botão de enviar');
    button.click();
    return true;
  }
  
  // Tentar encontrar pelo Enter key
  const promptField = findPromptField();
  if (promptField) {
    console.log('[LaCasaDark] Tentando Enter no campo');
    promptField.dispatchEvent(new KeyboardEvent('keydown', { 
      key: 'Enter', 
      code: 'Enter',
      keyCode: 13,
      bubbles: true 
    }));
    return true;
  }
  
  return false;
}

// Fluxo completo: Novo projeto -> Configurar -> Injetar prompt -> Enviar
async function startFullWorkflow(prompt, sceneNumber) {
  // Wrapper para compatibilidade
  return executeAutomation(prompt, sceneNumber);
}

// Delay helper
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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
async function injectPromptToFlow(prompt) {
  console.log('[LaCasaDark] Tentando injetar prompt:', prompt.substring(0, 50) + '...');

  const promptField = (await waitForPromptField(6000)) || findPromptField();
  
  if (!promptField) {
    showNotification('❌ Campo de prompt não encontrado!', 'error');
    return { success: false, error: 'Campo de prompt não encontrado' };
  }
  
  try {
    // Reusar a rotina robusta (fila) para inserir prompt
    await insertPrompt(promptField, prompt);
    
    console.log('[LaCasaDark] Prompt inserido com sucesso!');
    showNotification('✅ Prompt inserido!', 'success');

    // Tentar enviar/gerar (com retry + fallback Enter)
    await delay(350);
    let submitted = false;
    for (let i = 0; i < 8; i++) {
      // Em alguns estados o botão habilita poucos ms depois do input
      submitted = await clickSubmitButton();
      if (submitted) break;
      await delay(250);
    }

    if (submitted) {
      showNotification('🚀 Gerando vídeo...', 'info');
      // Iniciar monitor/download também no modo manual
      startVideoMonitor(currentSceneNumber);
      return { success: true };
    }

    showNotification('⚠️ Não consegui iniciar automaticamente — clique na seta →', 'warning');
    return { success: true, warning: 'Submit button not clicked' };
    
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
   progressThresholdReached = false;
   lastProgressValue = 0;
  console.log('[LaCasaDark] Monitorando vídeo para cena', currentSceneNumber);
  
   // Iniciar monitoramento de progresso (para enviar próximo em 65%)
   startProgressMonitor();
 
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

 // Monitorar progresso de geração para enviar próximo prompt em 65%
 function startProgressMonitor() {
   if (isMonitoringProgress) return;
   isMonitoringProgress = true;
   
   console.log('[LaCasaDark] Iniciando monitor de progresso (65%)');
   
   const checkProgress = () => {
     if (!isMonitoringProgress) return;
     
     // Procurar barras de progresso ou indicadores de %
     const progressElements = [
       ...document.querySelectorAll('[role="progressbar"]'),
       ...document.querySelectorAll('progress'),
       ...document.querySelectorAll('[class*="progress"]'),
       ...document.querySelectorAll('[class*="Progress"]'),
     ];
     
     for (const el of progressElements) {
       let progressValue = 0;
       
       if (el.hasAttribute('aria-valuenow')) {
         progressValue = parseFloat(el.getAttribute('aria-valuenow') || '0');
       } else if (el.hasAttribute('value')) {
         const max = parseFloat(el.getAttribute('max') || '100');
         const val = parseFloat(el.getAttribute('value') || '0');
         progressValue = (val / max) * 100;
       } else if (el.style.width && el.style.width.includes('%')) {
         progressValue = parseFloat(el.style.width);
       } else if (el.style.transform && el.style.transform.includes('scaleX')) {
         const match = el.style.transform.match(/scaleX\(([\d.]+)\)/);
         if (match) {
           progressValue = parseFloat(match[1]) * 100;
         }
       }
       
       const textContent = el.textContent || '';
       const percentMatch = textContent.match(/(\d+)\s*%/);
       if (percentMatch) {
         progressValue = parseFloat(percentMatch[1]);
       }
       
       if (progressValue > lastProgressValue) {
         lastProgressValue = progressValue;
         console.log('[LaCasaDark] Progresso:', progressValue + '%');
         
         if (progressValue >= 65 && !progressThresholdReached) {
           progressThresholdReached = true;
           console.log('[LaCasaDark] 🎯 65% atingido! Notificando para próximo prompt...');
           showNotification('⏭️ 65% - Preparando próximo...', 'info');
           
           chrome.runtime.sendMessage({
             type: 'PROGRESS_THRESHOLD_REACHED',
             sceneNumber: currentSceneNumber,
             progress: progressValue
           });
               
               // Também enviar via postMessage para o side panel
               window.postMessage({
                 type: 'PROGRESS_THRESHOLD_REACHED',
                 sceneNumber: currentSceneNumber,
                 progress: progressValue
               }, '*');
         }
       }
     }
     
     if (!progressThresholdReached) {
       const allText = document.body.innerText;
       const progressMatches = allText.match(/(\d{1,3})\s*%/g);
       if (progressMatches) {
         for (const match of progressMatches) {
           const value = parseInt(match);
           if (value > 0 && value <= 100 && value > lastProgressValue) {
             lastProgressValue = value;
             console.log('[LaCasaDark] Progresso (texto):', value + '%');
             
             if (value >= 65 && !progressThresholdReached) {
               progressThresholdReached = true;
               console.log('[LaCasaDark] 🎯 65% atingido via texto!');
               showNotification('⏭️ 65% - Preparando próximo...', 'info');
               
               chrome.runtime.sendMessage({
                 type: 'PROGRESS_THRESHOLD_REACHED',
                 sceneNumber: currentSceneNumber,
                 progress: value
               });
               
               // Também enviar via postMessage para o side panel
               window.postMessage({
                 type: 'PROGRESS_THRESHOLD_REACHED',
                 sceneNumber: currentSceneNumber,
                 progress: value
               }, '*');
             }
           }
         }
       }
     }
     
     if (isMonitoringProgress) {
       setTimeout(checkProgress, 2000);
     }
   };
   
   setTimeout(checkProgress, 3000);
 }
 
 function stopProgressMonitor() {
   isMonitoringProgress = false;
 }
 
function stopVideoMonitor() {
  if (videoObserver) {
    videoObserver.disconnect();
    videoObserver = null;
  }
  isMonitoringVideo = false;
   stopProgressMonitor();
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
      a.download = `cena-${sceneNum}.mp4`;
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
 console.log('[LaCasaDark CORE] ✅ Content script v3.0 ativo em:', window.location.href);

// Verificar se estamos na página certa
if (window.location.href.includes('labs.google') || window.location.href.includes('aitestkitchen')) {
  console.log('[LaCasaDark] Página do Flow detectada!');
  
  // Aguardar página carregar completamente
  setTimeout(() => {
    const field = findPromptField();
    if (field) {
      console.log('[LaCasaDark] ✅ Pronto para receber prompts');
       notifyReady();
    } else {
      console.log('[LaCasaDark] ⚠️ Campo de prompt não encontrado ainda');
    }
  }, 2000);
}
