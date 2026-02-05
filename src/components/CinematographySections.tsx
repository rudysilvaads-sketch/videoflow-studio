 import { useState } from "react";
 import { motion, AnimatePresence } from "framer-motion";
 import { Textarea } from "@/components/ui/textarea";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { 
   ChevronDown, 
   User, 
   Camera, 
   Sun, 
   MapPin, 
   Music, 
   Palette, 
   Ban,
   Shirt,
   Eye
 } from "lucide-react";
 import { CinematographySettings } from "@/types/character";
 
 interface CinematographySectionsProps {
   settings: CinematographySettings;
   onChange: (settings: CinematographySettings) => void;
 }
 
 interface SectionConfig {
   id: string;
   title: string;
   icon: React.ReactNode;
   fields: FieldConfig[];
 }
 
 interface FieldConfig {
   key: keyof CinematographySettings;
   label: string;
   placeholder: string;
   multiline?: boolean;
 }
 
 const sections: SectionConfig[] = [
   {
     id: "character",
     title: "CHARACTER LOCK",
     icon: <User className="w-3.5 h-3.5" />,
     fields: [
       { key: "physicalDescription", label: "Descrição Física", placeholder: "Pele, rosto, olhos, sobrancelhas, cicatrizes, características distintivas...", multiline: true },
       { key: "hairDescription", label: "Cabelo", placeholder: "Estilo, cor, comprimento, textura..." },
       { key: "accessories", label: "Acessórios", placeholder: "Piercings, brincos, anéis, colares..." },
       { key: "makeup", label: "Maquiagem", placeholder: "Estilo de maquiagem ou natural..." },
     ]
   },
   {
     id: "outfit",
     title: "OUTFIT & PROPS",
     icon: <Shirt className="w-3.5 h-3.5" />,
     fields: [
       { key: "outfit", label: "Roupa Fixa", placeholder: "Descrição detalhada da roupa que deve ser mantida...", multiline: true },
       { key: "props", label: "Objetos/Props", placeholder: "Objetos que o personagem carrega..." },
       { key: "bodyLanguage", label: "Linguagem Corporal", placeholder: "Postura padrão, expressões, gestos característicos..." },
     ]
   },
   {
     id: "cinematography",
     title: "CINEMATOGRAPHY",
     icon: <Camera className="w-3.5 h-3.5" />,
     fields: [
       { key: "shotType", label: "Tipo de Shot", placeholder: "Medium shot, Close-up, Wide shot..." },
       { key: "lensStyle", label: "Estilo de Lente", placeholder: "35mm cinematic, shallow depth of field..." },
       { key: "cameraMovement", label: "Movimento de Câmera", placeholder: "Handheld, tracking, static, dolly..." },
       { key: "focusDescription", label: "Foco", placeholder: "Descrição do foco e transições..." },
     ]
   },
   {
     id: "lighting",
     title: "LIGHTING",
     icon: <Sun className="w-3.5 h-3.5" />,
     fields: [
       { key: "lightingSetup", label: "Setup de Iluminação", placeholder: "Exterior night, studio, natural light..." },
       { key: "keyLight", label: "Key Light", placeholder: "Luz principal: direção, cor, intensidade..." },
       { key: "fillLight", label: "Fill Light", placeholder: "Luz de preenchimento..." },
       { key: "backLight", label: "Back Light", placeholder: "Contraluz, rim light..." },
       { key: "environmentalLighting", label: "Efeitos de Luz", placeholder: "Neon, reflexos de chuva, fog..." },
     ]
   },
   {
     id: "location",
     title: "LOCATION / CONTEXT",
     icon: <MapPin className="w-3.5 h-3.5" />,
     fields: [
       { key: "locationDescription", label: "Cenário", placeholder: "Descrição detalhada do local...", multiline: true },
       { key: "backgroundElements", label: "Elementos de Fundo", placeholder: "Objetos, pessoas, veículos ao fundo..." },
       { key: "atmosphericEffects", label: "Efeitos Atmosféricos", placeholder: "Névoa, chuva, poeira, fumaça..." },
     ]
   },
   {
     id: "audio",
     title: "AUDIO",
     icon: <Music className="w-3.5 h-3.5" />,
     fields: [
       { key: "ambientSound", label: "Som Ambiente", placeholder: "Sons de fundo, trânsito, natureza..." },
       { key: "sfx", label: "Efeitos Sonoros", placeholder: "Passos, portas, objetos..." },
       { key: "dialogue", label: "Diálogo", placeholder: "Falas do personagem..." },
     ]
   },
   {
     id: "style",
     title: "STYLE & COLOR",
     icon: <Palette className="w-3.5 h-3.5" />,
     fields: [
       { key: "colorPalette", label: "Paleta de Cores", placeholder: "Tons predominantes, acentos..." },
       { key: "visualStyle", label: "Estilo Visual", placeholder: "Film grain, cinematic, saturação..." },
     ]
   },
   {
     id: "negative",
     title: "NEGATIVE INSTRUCTIONS",
     icon: <Ban className="w-3.5 h-3.5" />,
     fields: [
       { key: "negativePrompt", label: "O Que NÃO Fazer", placeholder: "Não mudar roupa, não alterar cabelo, não adicionar pessoas...", multiline: true },
     ]
   },
 ];
 
 export function CinematographySections({ settings, onChange }: CinematographySectionsProps) {
   const [expandedSections, setExpandedSections] = useState<string[]>(["character"]);
 
   const toggleSection = (sectionId: string) => {
     setExpandedSections(prev => 
       prev.includes(sectionId) 
         ? prev.filter(id => id !== sectionId)
         : [...prev, sectionId]
     );
   };
 
   const updateField = (key: keyof CinematographySettings, value: string) => {
     onChange({ ...settings, [key]: value });
   };
 
   const getFilledCount = (section: SectionConfig): number => {
     return section.fields.filter(f => settings[f.key]?.trim()).length;
   };
 
   return (
     <div className="space-y-2">
       <div className="flex items-center gap-2 mb-3">
         <Eye className="w-4 h-4 text-primary" />
         <span className="text-xs font-semibold text-primary">Configurações Cinematográficas</span>
       </div>
       
       {sections.map((section) => {
         const isExpanded = expandedSections.includes(section.id);
         const filledCount = getFilledCount(section);
         const totalCount = section.fields.length;
         
         return (
           <div 
             key={section.id} 
             className="border border-border rounded-lg overflow-hidden bg-muted/20"
           >
             <button
               type="button"
               onClick={() => toggleSection(section.id)}
               className="w-full px-3 py-2 flex items-center justify-between hover:bg-muted/50 transition-colors"
             >
               <div className="flex items-center gap-2">
                 <span className="text-muted-foreground">{section.icon}</span>
                 <span className="text-xs font-medium">{section.title}</span>
                 {filledCount > 0 && (
                   <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary">
                     {filledCount}/{totalCount}
                   </span>
                 )}
               </div>
               <ChevronDown 
                 className={`w-4 h-4 text-muted-foreground transition-transform ${
                   isExpanded ? 'rotate-180' : ''
                 }`} 
               />
             </button>
             
             <AnimatePresence>
               {isExpanded && (
                 <motion.div
                   initial={{ height: 0, opacity: 0 }}
                   animate={{ height: "auto", opacity: 1 }}
                   exit={{ height: 0, opacity: 0 }}
                   transition={{ duration: 0.2 }}
                   className="overflow-hidden"
                 >
                   <div className="px-3 pb-3 space-y-3 border-t border-border/50">
                     {section.fields.map((field) => (
                       <div key={field.key} className="space-y-1 pt-2">
                         <Label className="text-[10px] text-muted-foreground">
                           {field.label}
                         </Label>
                         {field.multiline ? (
                           <Textarea
                             placeholder={field.placeholder}
                             value={settings[field.key] || ""}
                             onChange={(e) => updateField(field.key, e.target.value)}
                             className="min-h-16 text-xs resize-none"
                           />
                         ) : (
                           <Input
                             placeholder={field.placeholder}
                             value={settings[field.key] || ""}
                             onChange={(e) => updateField(field.key, e.target.value)}
                             className="h-8 text-xs"
                           />
                         )}
                       </div>
                     ))}
                   </div>
                 </motion.div>
               )}
             </AnimatePresence>
           </div>
         );
       })}
     </div>
   );
 }