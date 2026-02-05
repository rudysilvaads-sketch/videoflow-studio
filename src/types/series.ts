 export interface Episode {
   id: string;
   title: string;
   description: string;
   scenario: string;
   soundscape: string;
   weather?: string;
   timeOfDay?: string;
   action?: string;
   completed?: boolean;
   videoCount?: number;
 }
 
 export interface Series {
   id: string;
   title: string;
   description: string;
   icon: string;
   color: string;
   episodes: Episode[];
   createdAt: string;
   updatedAt: string;
 }
 
 export interface Scenario {
   id: string;
   name: string;
   description: string;
   category: ScenarioCategory;
   environment: string;
   details: string;
   suggestedSounds: string[];
   suggestedWeather?: string[];
   suggestedActions?: string[];
   icon: string;
 }
 
 export type ScenarioCategory = 
   | 'shelter'      // Abrigos e construções
   | 'exploration'  // Exploração de locais
   | 'survival'     // Sobrevivência (caça, água, comida)
   | 'weather'      // Clima e ambiente
   | 'ruins'        // Ruínas e cidades abandonadas
   | 'nature';      // Natureza selvagem