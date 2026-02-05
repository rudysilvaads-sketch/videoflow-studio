 import { CinematographySettings } from "@/types/character";
 
 export function generateCinematographyPrompt(
   characterName: string,
   basePrompt: string,
   settings: CinematographySettings
 ): string {
   const sections: string[] = [];
   
   // Header
   sections.push(`PROJECT: Character-consistent cinematic video, same protagonist across all shots.`);
   sections.push("");
   
   // CHARACTER LOCK
   const characterParts: string[] = [];
   if (settings.physicalDescription) {
     characterParts.push(settings.physicalDescription);
   }
   if (settings.hairDescription) {
     characterParts.push(`Hair: ${settings.hairDescription}`);
   }
   if (settings.accessories) {
     characterParts.push(`Distinctive accessories: ${settings.accessories}`);
   }
   if (settings.makeup) {
     characterParts.push(`Makeup: ${settings.makeup}`);
   }
   if (settings.outfit) {
     characterParts.push(`Outfit locked: ${settings.outfit}`);
   }
   if (settings.props) {
     characterParts.push(`Prop locked: ${settings.props}`);
   }
   if (settings.bodyLanguage) {
     characterParts.push(`Body language: ${settings.bodyLanguage}`);
   }
   
   if (characterParts.length > 0 || basePrompt) {
     sections.push(`CHARACTER LOCK (PASTE EXACTLY THIS IN EVERY SCENE, DO NOT EDIT):`);
     sections.push("");
     if (basePrompt) {
       sections.push(basePrompt);
       sections.push("");
     }
     characterParts.forEach(part => {
       sections.push(part);
       sections.push("");
     });
     sections.push(`DO NOT CHANGE ${characterName ? characterName.toUpperCase() + "'s" : "their"} face, hair length/style, outfit, accessories, skin tone, or prop placement across scenes.`);
     sections.push("");
   }
   
   // CINEMATOGRAPHY
   const cinematographyParts: string[] = [];
   if (settings.shotType) {
     cinematographyParts.push(`- Shot: ${settings.shotType}`);
   }
   if (settings.lensStyle) {
     cinematographyParts.push(`- Lens feel: ${settings.lensStyle}`);
   }
   if (settings.cameraMovement) {
     cinematographyParts.push(`- Camera movement: ${settings.cameraMovement}`);
   }
   if (settings.focusDescription) {
     cinematographyParts.push(`- Focus: ${settings.focusDescription}`);
   }
   
   if (cinematographyParts.length > 0) {
     sections.push("CINEMATOGRAPHY:");
     sections.push("");
     cinematographyParts.forEach(part => sections.push(part));
     sections.push("");
   }
   
   // LIGHTING
   const lightingParts: string[] = [];
   if (settings.lightingSetup) {
     lightingParts.push(`- Setup: ${settings.lightingSetup}`);
   }
   if (settings.keyLight) {
     lightingParts.push(`- Key light: ${settings.keyLight}`);
   }
   if (settings.fillLight) {
     lightingParts.push(`- Fill: ${settings.fillLight}`);
   }
   if (settings.backLight) {
     lightingParts.push(`- Backlight: ${settings.backLight}`);
   }
   if (settings.environmentalLighting) {
     lightingParts.push(`- Environment: ${settings.environmentalLighting}`);
   }
   
   if (lightingParts.length > 0) {
     sections.push("LIGHTING:");
     sections.push("");
     lightingParts.forEach(part => sections.push(part));
     sections.push("");
   }
   
   // LOCATION / CONTEXT
   const locationParts: string[] = [];
   if (settings.locationDescription) {
     locationParts.push(`- Location: ${settings.locationDescription}`);
   }
   if (settings.backgroundElements) {
     locationParts.push(`- Background: ${settings.backgroundElements}`);
   }
   if (settings.atmosphericEffects) {
     locationParts.push(`- Atmosphere: ${settings.atmosphericEffects}`);
   }
   
   if (locationParts.length > 0) {
     sections.push("LOCATION / CONTEXT:");
     sections.push("");
     locationParts.forEach(part => sections.push(part));
     sections.push("");
   }
   
   // AUDIO
   const audioParts: string[] = [];
   if (settings.ambientSound) {
     audioParts.push(`- Ambient: ${settings.ambientSound}`);
   }
   if (settings.sfx) {
     audioParts.push(`- SFX: ${settings.sfx}`);
   }
   if (settings.dialogue) {
     audioParts.push(`- Dialogue: ${settings.dialogue}`);
   }
   
   if (audioParts.length > 0) {
     sections.push("AUDIO:");
     sections.push("");
     audioParts.forEach(part => sections.push(part));
     sections.push("");
   }
   
   // STYLE & COLOR
   const styleParts: string[] = [];
   if (settings.colorPalette) {
     styleParts.push(`- Palette: ${settings.colorPalette}`);
   }
   if (settings.visualStyle) {
     styleParts.push(`- Style: ${settings.visualStyle}`);
   }
   
   if (styleParts.length > 0) {
     sections.push("STYLE & COLOR:");
     sections.push("");
     styleParts.forEach(part => sections.push(part));
     sections.push("");
   }
   
   // NEGATIVE INSTRUCTIONS
   if (settings.negativePrompt) {
     sections.push("NEGATIVE INSTRUCTIONS:");
     sections.push("");
     sections.push(settings.negativePrompt);
     sections.push("");
   }
   
   return sections.join("\n").trim();
 }
 
 export function generateCompactPrompt(
   basePrompt: string,
   settings: CinematographySettings
 ): string {
   // Versão compacta para uso em gerações individuais
   const parts: string[] = [];
   
   if (basePrompt) parts.push(basePrompt);
   
   // Character details inline
   const charDetails = [
     settings.physicalDescription,
     settings.hairDescription ? `Hair: ${settings.hairDescription}` : null,
     settings.outfit ? `Wearing: ${settings.outfit}` : null,
     settings.props ? `Carrying: ${settings.props}` : null,
   ].filter(Boolean);
   
   if (charDetails.length > 0) {
     parts.push(charDetails.join(". "));
   }
   
   // Cinematography inline
   const cinemaDetails = [
     settings.shotType,
     settings.lensStyle,
     settings.cameraMovement,
   ].filter(Boolean);
   
   if (cinemaDetails.length > 0) {
     parts.push(cinemaDetails.join(", "));
   }
   
   // Lighting inline
   const lightDetails = [
     settings.lightingSetup,
     settings.keyLight,
     settings.environmentalLighting,
   ].filter(Boolean);
   
   if (lightDetails.length > 0) {
     parts.push(lightDetails.join(", "));
   }
   
   // Location
   if (settings.locationDescription) {
     parts.push(settings.locationDescription);
   }
   
   // Style
   const styleDetails = [
     settings.colorPalette,
     settings.visualStyle,
   ].filter(Boolean);
   
   if (styleDetails.length > 0) {
     parts.push(styleDetails.join(", "));
   }
   
   // Negative at the end
   if (settings.negativePrompt) {
     parts.push(`[Avoid: ${settings.negativePrompt}]`);
   }
   
   return parts.join(". ").trim();
 }