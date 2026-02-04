export interface PromptHistoryItem {
  id: string;
  characterId: string;
  characterName: string;
  templateName?: string;
  promptType: 'scene' | 'action' | 'dialogue';
  userPrompt: string;
  fullPrompt: string;
  createdAt: Date;
  isFavorite: boolean;
}

const HISTORY_KEY = 'characterflow_history';
const MAX_HISTORY_ITEMS = 50;

export function getPromptHistory(): PromptHistoryItem[] {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (stored) {
      const items = JSON.parse(stored);
      return items.map((item: PromptHistoryItem) => ({
        ...item,
        createdAt: new Date(item.createdAt),
      }));
    }
  } catch (error) {
    console.error('Error loading history:', error);
  }
  return [];
}

export function savePromptToHistory(item: Omit<PromptHistoryItem, 'id' | 'createdAt' | 'isFavorite'>): PromptHistoryItem {
  const history = getPromptHistory();
  
  const newItem: PromptHistoryItem = {
    ...item,
    id: crypto.randomUUID(),
    createdAt: new Date(),
    isFavorite: false,
  };
  
  const updatedHistory = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  
  return newItem;
}

export function toggleFavorite(itemId: string): void {
  const history = getPromptHistory();
  const updatedHistory = history.map(item => 
    item.id === itemId ? { ...item, isFavorite: !item.isFavorite } : item
  );
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
}

export function deleteHistoryItem(itemId: string): void {
  const history = getPromptHistory();
  const updatedHistory = history.filter(item => item.id !== itemId);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
}

export function clearHistory(): void {
  const history = getPromptHistory();
  // Keep only favorites
  const favorites = history.filter(item => item.isFavorite);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(favorites));
}
