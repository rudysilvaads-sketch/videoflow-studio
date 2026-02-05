 export interface Episode {
   id: string;
   title: string;
   description: string;
   targetDuration: number; // em minutos (8-16)
   sceneDuration: number; // segundos por cena (default 8)
   beats: NarrativeBeat[];
   characterId?: string;
   visualStyle?: string;
   createdAt: Date;
   updatedAt: Date;
 }
 
 export interface NarrativeBeat {
   id: string;
   name: string;
   description: string;
   emotionalTone: string;
   location?: string;
   scenes: EpisodeScene[];
   order: number;
 }
 
 export interface EpisodeScene {
   id: string;
   beatId: string;
   prompt: string;
   sceneNumber: number;
   status: 'pending' | 'generating' | 'completed' | 'error';
   notes?: string;
 }
 
 export interface EpisodeStats {
   totalScenes: number;
   completedScenes: number;
   totalDuration: number; // em segundos
   estimatedMinutes: number;
 }
 
 export const BEAT_TEMPLATES = [
   { name: "Abertura", description: "Estabelecer o mundo e o protagonista", emotionalTone: "contemplativo" },
   { name: "Incidente", description: "Algo quebra a rotina", emotionalTone: "tensão" },
   { name: "Exploração", description: "Investigar ou buscar recursos", emotionalTone: "suspense" },
   { name: "Confronto", description: "Enfrentar perigo ou obstáculo", emotionalTone: "intenso" },
   { name: "Consequência", description: "Lidar com resultado da ação", emotionalTone: "reflexivo" },
   { name: "Preparação", description: "Planejar próximo movimento", emotionalTone: "determinado" },
   { name: "Clímax", description: "Momento de maior tensão", emotionalTone: "dramático" },
   { name: "Resolução", description: "Novo equilíbrio ou gancho", emotionalTone: "esperança/mistério" },
 ];