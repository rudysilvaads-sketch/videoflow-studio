// Content script para interagir com a página do Google Flow

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'INJECT_PROMPT') {
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
      promptField.value = message.prompt;
      promptField.dispatchEvent(new Event('input', { bubbles: true }));
      promptField.dispatchEvent(new Event('change', { bubbles: true }));
      
      // Notificar sucesso
      sendResponse({ success: true });
      
      // Mostrar feedback visual
      showNotification('Prompt inserido com sucesso!');
    } else {
      sendResponse({ success: false, error: 'Campo de prompt não encontrado' });
      showNotification('Campo de prompt não encontrado', 'error');
    }
  }
  return true;
});

function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 24px;
    background: ${type === 'success' ? '#22c55e' : '#ef4444'};
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
