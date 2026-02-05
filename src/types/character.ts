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
  cinematography?: CinematographySettings;
  createdAt: Date;
}

export interface CinematographySettings {
  // CHARACTER LOCK - Descrição física detalhada
  physicalDescription?: string;  // Pele, rosto, olhos, sobrancelhas, características distintivas
  hairDescription?: string;      // Cabelo: estilo, cor, comprimento
  accessories?: string;          // Acessórios distintivos (piercings, brincos, etc)
  makeup?: string;               // Maquiagem ou ausência dela
  outfit?: string;               // Roupa fixa para consistência
  props?: string;                // Objetos que o personagem carrega
  bodyLanguage?: string;         // Linguagem corporal padrão
  
  // CINEMATOGRAPHY
  shotType?: string;             // Ex: Medium shot, Close-up, Wide shot
  lensStyle?: string;            // Ex: 35mm cinematic, shallow depth of field
  cameraMovement?: string;       // Ex: handheld, tracking, static
  focusDescription?: string;     // Descrição do foco e rack focus
  
  // LIGHTING
  lightingSetup?: string;        // Ex: exterior night, studio, natural
  keyLight?: string;             // Luz principal
  fillLight?: string;            // Luz de preenchimento
  backLight?: string;            // Contraluz
  environmentalLighting?: string; // Efeitos como chuva, neon, etc
  
  // LOCATION / CONTEXT
  locationDescription?: string;  // Descrição do cenário
  backgroundElements?: string;   // Elementos de fundo
  atmosphericEffects?: string;   // Efeitos atmosféricos (névoa, chuva, etc)
  
  // AUDIO (para referência em vídeos)
  ambientSound?: string;         // Sons ambiente
  sfx?: string;                  // Efeitos sonoros
  dialogue?: string;             // Diálogos ou falas
  
  // STYLE & COLOR
  colorPalette?: string;         // Paleta de cores
  visualStyle?: string;          // Estilo visual (film grain, etc)
  
  // NEGATIVE INSTRUCTIONS
  negativePrompt?: string;       // O que NÃO fazer/mudar
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
