export interface BatchPromptItem {
  id: string;
  prompt: string;
  sceneNumber: number;
  status: 'pending' | 'sending' | 'processing' | 'downloading' | 'completed' | 'error';
  videoUrl?: string;
  downloadedAt?: Date;
  errorMessage?: string;
  createdAt: Date;
}

export interface BatchSession {
  id: string;
  name: string;
  characterId?: string;
  characterName?: string;
  characterBasePrompt?: string;
  templateId?: string;
  templateName?: string;
  templatePrompt?: string;
  items: BatchPromptItem[];
  currentIndex: number;
  isRunning: boolean;
  downloadFolder: string;
  createdAt: Date;
}

const BATCH_KEY = 'characterflow_batch';

export function getCurrentBatch(): BatchSession | null {
  try {
    const stored = localStorage.getItem(BATCH_KEY);
    if (stored) {
      const session = JSON.parse(stored);
      return {
        ...session,
        createdAt: new Date(session.createdAt),
        items: session.items.map((item: BatchPromptItem) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          downloadedAt: item.downloadedAt ? new Date(item.downloadedAt) : undefined,
        })),
      };
    }
  } catch (error) {
    console.error('Error loading batch:', error);
  }
  return null;
}

export function saveBatch(session: BatchSession): void {
  localStorage.setItem(BATCH_KEY, JSON.stringify(session));
}

export interface BatchConfig {
  characterId?: string;
  characterName?: string;
  characterBasePrompt?: string;
  templateId?: string;
  templateName?: string;
  templatePrompt?: string;
}

export function createBatchFromText(
  text: string, 
  config?: BatchConfig
): BatchSession {
  // Separar por linhas em branco duplas (parágrafos) ao invés de cada linha
  // Isso permite prompts multi-linha
  const prompts = text
    .split(/\n\s*\n/) // Divide por uma ou mais linhas em branco
    .map(prompt => prompt.trim())
    .filter(prompt => prompt.length > 0);

  // Build full prompt for each line combining character + template + user input
  const items: BatchPromptItem[] = prompts.map((promptText, index) => {
    let fullPrompt = '';
    
    // Add character base prompt if provided
    if (config?.characterBasePrompt) {
      fullPrompt += config.characterBasePrompt;
    }
    
    // Add template prompt if provided
    if (config?.templatePrompt) {
      fullPrompt += fullPrompt ? '\n\n' : '';
      fullPrompt += `[TEMPLATE: ${config.templateName}]\n${config.templatePrompt}`;
    }
    
    // Add user's scene description
    fullPrompt += fullPrompt ? '\n\n' : '';
    fullPrompt += `[SCENE ${index + 1}]: ${promptText}`;

    return {
      id: crypto.randomUUID(),
      prompt: fullPrompt,
      sceneNumber: index + 1,
      status: 'pending',
      createdAt: new Date(),
    };
  });

  const session: BatchSession = {
    id: crypto.randomUUID(),
    name: `Batch ${new Date().toLocaleString('pt-BR')}`,
    characterId: config?.characterId,
    characterName: config?.characterName,
    characterBasePrompt: config?.characterBasePrompt,
    templateId: config?.templateId,
    templateName: config?.templateName,
    templatePrompt: config?.templatePrompt,
    items,
    currentIndex: 0,
    isRunning: false,
    downloadFolder: 'LaCasaDark_Scenes',
    createdAt: new Date(),
  };

  saveBatch(session);
  return session;
}

export function updateBatchItem(
  session: BatchSession, 
  itemId: string, 
  updates: Partial<BatchPromptItem>
): BatchSession {
  const updatedSession = {
    ...session,
    items: session.items.map(item =>
      item.id === itemId ? { ...item, ...updates } : item
    ),
  };
  saveBatch(updatedSession);
  return updatedSession;
}

export function updateBatchSession(updates: Partial<BatchSession>): BatchSession | null {
  const current = getCurrentBatch();
  if (!current) return null;
  
  const updated = { ...current, ...updates };
  saveBatch(updated);
  return updated;
}

export function clearBatch(): void {
  localStorage.removeItem(BATCH_KEY);
}

export function appendToBatch(
  text: string,
  config?: BatchConfig
): BatchSession {
  const existingSession = getCurrentBatch();
  
  // Separar por linhas em branco duplas (parágrafos)
  const prompts = text
    .split(/\n\s*\n/)
    .map(prompt => prompt.trim())
    .filter(prompt => prompt.length > 0);

  // Calcular próximo número de cena baseado no batch existente
  const startingSceneNumber = existingSession 
    ? existingSession.items.length + 1 
    : 1;

  const newItems: BatchPromptItem[] = prompts.map((promptText, index) => {
    const sceneNumber = startingSceneNumber + index;
    let fullPrompt = '';
    
    if (config?.characterBasePrompt) {
      fullPrompt += config.characterBasePrompt;
    }
    
    if (config?.templatePrompt) {
      fullPrompt += fullPrompt ? '\n\n' : '';
      fullPrompt += `[TEMPLATE: ${config.templateName}]\n${config.templatePrompt}`;
    }
    
    fullPrompt += fullPrompt ? '\n\n' : '';
    fullPrompt += `[SCENE ${sceneNumber}]: ${promptText}`;

    return {
      id: crypto.randomUUID(),
      prompt: fullPrompt,
      sceneNumber,
      status: 'pending',
      createdAt: new Date(),
    };
  });

  if (existingSession) {
    // Append to existing session
    const updatedSession: BatchSession = {
      ...existingSession,
      items: [...existingSession.items, ...newItems],
    };
    saveBatch(updatedSession);
    return updatedSession;
  } else {
    // Create new session
    const session: BatchSession = {
      id: crypto.randomUUID(),
      name: `Batch ${new Date().toLocaleString('pt-BR')}`,
      characterId: config?.characterId,
      characterName: config?.characterName,
      characterBasePrompt: config?.characterBasePrompt,
      templateId: config?.templateId,
      templateName: config?.templateName,
      templatePrompt: config?.templatePrompt,
      items: newItems,
      currentIndex: 0,
      isRunning: false,
      downloadFolder: 'LaCasaDark_Scenes',
      createdAt: new Date(),
    };
    saveBatch(session);
    return session;
  }
}

export function getNextPendingItem(session: BatchSession): BatchPromptItem | null {
  return session.items.find(item => item.status === 'pending') || null;
}

export function getBatchProgress(session: BatchSession): {
  completed: number;
  total: number;
  percentage: number;
} {
  const completed = session.items.filter(item => item.status === 'completed').length;
  const total = session.items.length;
  return {
    completed,
    total,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}
