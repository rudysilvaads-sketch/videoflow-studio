export interface Character {
  id: string;
  name: string;
  description: string;
  basePrompt: string;
  imageUrl?: string;
  attributes: {
    age?: string;
    gender?: string;
    style?: string;
    features?: string[];
  };
  createdAt: Date;
}

export interface Prompt {
  id: string;
  characterId: string;
  content: string;
  type: 'scene' | 'action' | 'dialogue';
  status: 'pending' | 'processing' | 'completed' | 'error';
  result?: string;
  errorMessage?: string;
  createdAt: Date;
}

export interface ApiConfig {
  primaryApiKey: string;
  fallbackApiKey: string;
  model: string;
  maxRetries: number;
}
