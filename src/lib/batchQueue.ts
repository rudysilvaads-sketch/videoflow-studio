export interface BatchPromptItem {
  id: string;
  prompt: string;
  sceneNumber: number;
  status: 'pending' | 'sending' | 'processing' | 'completed' | 'error';
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

export function createBatchFromText(
  text: string, 
  characterId?: string, 
  characterName?: string
): BatchSession {
  const lines = text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  const items: BatchPromptItem[] = lines.map((line, index) => ({
    id: crypto.randomUUID(),
    prompt: line,
    sceneNumber: index + 1,
    status: 'pending',
    createdAt: new Date(),
  }));

  const session: BatchSession = {
    id: crypto.randomUUID(),
    name: `Batch ${new Date().toLocaleString('pt-BR')}`,
    characterId,
    characterName,
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
