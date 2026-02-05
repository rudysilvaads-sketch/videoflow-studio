import { useState } from "react";
import { motion } from "framer-motion";
import { 
  User, 
  Lock, 
  Unlock, 
  Copy, 
  Check,
  Edit3,
  Sparkles,
  Eye,
  EyeOff,
  ImagePlus,
  Loader2,
  ChevronDown,
  ChevronUp,
  Palette,
  Shirt,
  Glasses,
   Footprints,
   UserCheck,
   ShirtIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
 import { Switch } from "@/components/ui/switch";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { survivorCharacterTemplate } from "@/data/survivalScenarios";
import { cn } from "@/lib/utils";
import { useImageFxGeneration } from "@/hooks/useImageFxGeneration";
import { useCredentials } from "@/hooks/useCredentials";
import { Separator } from "@/components/ui/separator";
 import { supabase } from "@/integrations/supabase/client";
 import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface SurvivorProfileProps {
  profile: {
    name: string;
    basePrompt: string;
    isLocked: boolean;
    visualStyle: string;
    avatarUrl?: string;
    avatarSeed?: number;
    // Detalhes estruturados para consistência máxima
    details?: CharacterDetails;
     // Configurações de travamento
     lockClothing?: boolean;
     lockPhysicalOnly?: boolean;
  };
  onProfileChange: (profile: {
    name: string;
    basePrompt: string;
    isLocked: boolean;
    visualStyle: string;
    avatarUrl?: string;
    avatarSeed?: number;
    details?: CharacterDetails;
     lockClothing?: boolean;
     lockPhysicalOnly?: boolean;
  }) => void;
}

interface CharacterDetails {
  // Rosto e cabeça
  faceShape?: string;
  skinTone?: string;
  eyeColor?: string;
  eyeShape?: string;
  eyebrows?: string;
  nose?: string;
  lips?: string;
  facialHair?: string;
  facialMarks?: string;
  
  // Cabelo
  hairStyle?: string;
  hairColor?: string;
  hairLength?: string;
  hairTexture?: string;
  
  // Corpo
  bodyType?: string;
  height?: string;
  age?: string;
  posture?: string;
  
  // Roupas
  topClothing?: string;
  bottomClothing?: string;
  footwear?: string;
  outerLayer?: string;
  
  // Acessórios
  accessories?: string;
  jewelry?: string;
  headwear?: string;
  
  // Expressão e comportamento
  defaultExpression?: string;
  bodyLanguage?: string;
  distinctiveFeatures?: string;
  
  // Identificador único
  characterId?: string;
}

const DETAIL_PLACEHOLDERS: Record<keyof CharacterDetails, string> = {
  faceShape: "oval, angular, redondo, quadrado...",
  skinTone: "bronzeada, pálida, oliveira, negra, sardenta...",
  eyeColor: "castanhos escuros, azuis gélidos, verdes, âmbar...",
  eyeShape: "amendoados, grandes, profundos, levemente caídos...",
  eyebrows: "grossas e escuras, arqueadas, finas...",
  nose: "aquilino, largo, pequeno, levemente torto...",
  lips: "finos, carnudos, rachados pelo frio...",
  facialHair: "barba de vários dias, cavanhaque, bigode, limpo...",
  facialMarks: "cicatriz na sobrancelha esquerda, sinal no queixo...",
  hairStyle: "bagunçado, raspado nas laterais, preso em rabo...",
  hairColor: "castanho-escuro, grisalho, loiro sujo, ruivo...",
  hairLength: "curto, médio na nuca, longo até os ombros...",
  hairTexture: "liso, ondulado, cacheado, crespo...",
  bodyType: "atlético, magro, musculoso, robusto...",
  height: "alto (1,85m), médio, baixo...",
  age: "35-40 anos, jovem adulto, meia-idade...",
  posture: "vigilante, curvado, confiante, tenso...",
  topClothing: "camisa cinza surrada, camiseta preta, moletom...",
  bottomClothing: "calças cargo marrons, jeans rasgado...",
  footwear: "botas de couro surradas, tênis gastos...",
  outerLayer: "jaqueta militar verde-oliva, casaco de couro...",
  accessories: "mochila tática, faca no cinto, cantil...",
  jewelry: "nenhum, aliança antiga, cordão com pingente...",
  headwear: "nenhum, boné, capuz, bandana...",
  defaultExpression: "sempre séria e vigilante, desconfiado...",
  bodyLanguage: "movimentos cautelosos e silenciosos...",
  distinctiveFeatures: "mãos calejadas, andar manco, voz rouca...",
  characterId: "THE LAST HUMAN SURVIVOR",
};

function buildPromptFromDetails(
   details: CharacterDetails, 
   name: string,
   lockClothing: boolean = true,
   lockPhysicalOnly: boolean = false
 ): string {
  const parts: string[] = [];
  
  // Intro com idade/tipo
  if (details.age || details.bodyType || details.height) {
    parts.push([details.age, details.bodyType, details.height].filter(Boolean).join(", "));
  }
  
  // Cabelo
  if (details.hairColor || details.hairStyle || details.hairLength || details.hairTexture) {
    const hair = ["cabelos", details.hairColor, details.hairLength, details.hairTexture, details.hairStyle].filter(Boolean).join(" ");
    parts.push(hair);
  }
  
  // Rosto
  const faceParts = [
    details.faceShape && `rosto ${details.faceShape}`,
    details.skinTone && `pele ${details.skinTone}`,
    details.eyeColor && `olhos ${details.eyeColor}`,
    details.eyeShape && `(${details.eyeShape})`,
    details.eyebrows && `sobrancelhas ${details.eyebrows}`,
    details.nose && `nariz ${details.nose}`,
    details.lips && `lábios ${details.lips}`,
    details.facialHair,
    details.facialMarks,
  ].filter(Boolean);
  if (faceParts.length) parts.push(faceParts.join(", "));
  
   // Roupas (só inclui se lockClothing estiver ativo e não for lockPhysicalOnly)
   if (lockClothing && !lockPhysicalOnly) {
     const clothingParts = [
       details.outerLayer && `Veste ${details.outerLayer}`,
       details.topClothing && `sobre ${details.topClothing}`,
       details.bottomClothing,
       details.footwear,
     ].filter(Boolean);
     if (clothingParts.length) parts.push(clothingParts.join(", "));
   }
  
   // Acessórios (só inclui se lockClothing estiver ativo e não for lockPhysicalOnly)
   if (lockClothing && !lockPhysicalOnly) {
     const accParts = [details.accessories, details.jewelry, details.headwear].filter(Boolean);
     if (accParts.length) parts.push(accParts.join(", "));
   }
  
  // Expressão e comportamento
  if (details.defaultExpression) parts.push(`Expressão ${details.defaultExpression}`);
  if (details.bodyLanguage) parts.push(details.bodyLanguage);
  if (details.distinctiveFeatures) parts.push(details.distinctiveFeatures);
  
  // Identificador único
  if (details.characterId) parts.push(`[${details.characterId}]`);
   
   // Adiciona nota sobre variação de roupa se lockPhysicalOnly
   if (lockPhysicalOnly) {
     parts.push("[MANTER ROSTO E FÍSICO IDÊNTICOS, ROUPA PODE VARIAR]");
   }
  
  return parts.join(". ").replace(/\.\./g, ".");
}

export function SurvivorProfile({ profile, onProfileChange }: SurvivorProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showImageGenerator, setShowImageGenerator] = useState(false);
  const [useStructuredMode, setUseStructuredMode] = useState(false);
  const [localDetails, setLocalDetails] = useState<CharacterDetails>(profile.details || {});
   const [isGeneratingWithAI, setIsGeneratingWithAI] = useState(false);
   const [aiDescription, setAiDescription] = useState("");

  const { generate, isGenerating, lastResult } = useImageFxGeneration();
  const { hasImageFxCookies } = useCredentials();

  const updateDetail = (key: keyof CharacterDetails, value: string) => {
    setLocalDetails(prev => ({ ...prev, [key]: value }));
  };
 
   const fillWithAI = async () => {
     if (!aiDescription.trim()) {
       toast.error("Digite uma descrição básica do personagem");
       return;
     }
     
     setIsGeneratingWithAI(true);
     try {
       const { data, error } = await supabase.functions.invoke('generate-character-details', {
         body: { description: aiDescription, name: profile.name }
       });
       
       if (error) throw error;
       if (data.error) throw new Error(data.error);
       
       if (data.details) {
         setLocalDetails(data.details);
         toast.success("Detalhes preenchidos com IA!");
       }
     } catch (err) {
       console.error("Error generating with AI:", err);
       toast.error(err instanceof Error ? err.message : "Erro ao gerar com IA");
     } finally {
       setIsGeneratingWithAI(false);
     }
   };

  const applyStructuredDetails = () => {
     const generatedPrompt = buildPromptFromDetails(
       localDetails, 
       profile.name,
       profile.lockClothing !== false,
       profile.lockPhysicalOnly || false
     );
    onProfileChange({
      ...profile,
      basePrompt: generatedPrompt,
      details: localDetails,
    });
    setUseStructuredMode(false);
    setIsEditing(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profile.basePrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetToDefault = () => {
    onProfileChange({
      name: survivorCharacterTemplate.name,
      basePrompt: survivorCharacterTemplate.basePrompt,
      isLocked: true,
      visualStyle: survivorCharacterTemplate.visualStyle || "",
      avatarUrl: undefined,
      avatarSeed: undefined,
    });
    setIsEditing(false);
  };

  const toggleLock = () => {
    onProfileChange({ ...profile, isLocked: !profile.isLocked });
  };

  const generateAvatar = async () => {
    const portraitPrompt = `Close-up portrait photograph, ${profile.basePrompt}, ${profile.visualStyle}, cinematic lighting, detailed face, shallow depth of field`;
    
    const result = await generate(portraitPrompt);
    
    if (result && result.images.length > 0) {
      onProfileChange({
        ...profile,
        avatarUrl: result.images[0],
        avatarSeed: result.seed,
      });
      setShowImageGenerator(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card overflow-hidden"
    >
      {/* Header */}
      <div className="p-3 bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {profile.avatarUrl ? (
              <img 
                src={profile.avatarUrl} 
                alt={profile.name}
                className="w-10 h-10 rounded-lg object-cover ring-2 ring-primary/30"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <User className="w-5 h-5 text-primary-foreground" />
              </div>
            )}
            <div>
              <h3 className="text-sm font-semibold">{profile.name}</h3>
              <p className="text-[10px] text-muted-foreground">Personagem Principal</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {hasImageFxCookies && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={generateAvatar}
                disabled={isGenerating}
                title="Gerar avatar com ImageFX"
              >
                {isGenerating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                ) : (
                  <ImagePlus className="w-3.5 h-3.5 text-primary" />
                )}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={toggleLock}
            >
              {profile.isLocked ? (
                <Lock className="w-3.5 h-3.5 text-accent" />
              ) : (
                <Unlock className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit3 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Lock Status */}
        <div className="flex items-center gap-2 mt-2">
           <div className="flex flex-wrap items-center gap-1.5">
          <Badge 
            variant={profile.isLocked ? "default" : "secondary"}
            className="text-[10px] h-5"
          >
            {profile.isLocked ? (
              <>
                <Lock className="w-2.5 h-2.5 mr-1" />
                 Travado
              </>
            ) : (
              <>
                <Unlock className="w-2.5 h-2.5 mr-1" />
                Desbloqueado
              </>
            )}
          </Badge>
           {profile.isLocked && (
             <Badge 
               variant={profile.lockPhysicalOnly ? "outline" : "default"}
               className={`text-[9px] h-5 ${profile.lockPhysicalOnly ? 'border-accent text-accent' : ''}`}
             >
               {profile.lockPhysicalOnly ? (
                 <>
                   <UserCheck className="w-2.5 h-2.5 mr-1" />
                   Só Físico
                 </>
               ) : (
                 <>
                   <ShirtIcon className="w-2.5 h-2.5 mr-1" />
                   +Roupa
                 </>
               )}
             </Badge>
           )}
          {profile.avatarSeed && (
            <Badge variant="outline" className="text-[9px] h-5">
              Seed: {profile.avatarSeed}
            </Badge>
          )}
           </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-3">
        {isEditing ? (
          <div className="space-y-3">
            {/* Toggle entre modo texto livre e estruturado */}
            <div className="flex gap-2 p-2 rounded-lg bg-muted/50">
              <Button
                variant={useStructuredMode ? "outline" : "default"}
                size="sm"
                className="flex-1 h-7 text-[10px]"
                onClick={() => setUseStructuredMode(false)}
              >
                Texto Livre
              </Button>
              <Button
                variant={useStructuredMode ? "default" : "outline"}
                size="sm"
                className="flex-1 h-7 text-[10px]"
                onClick={() => setUseStructuredMode(true)}
              >
                ✨ Estruturado (Máx. Consistência)
              </Button>
            </div>

            <div>
              <Label className="text-xs">Nome do Personagem</Label>
              <Input
                value={profile.name}
                onChange={(e) => onProfileChange({ ...profile, name: e.target.value })}
                className="mt-1 h-8"
              />
            </div>
             
             {/* Toggles de Travamento */}
             <div className="p-2.5 rounded-lg bg-muted/50 border border-border space-y-2">
               <p className="text-[10px] font-medium text-muted-foreground mb-2">
                 ⚙️ Configurações de Travamento
               </p>
               
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <ShirtIcon className="w-3.5 h-3.5 text-primary" />
                   <Label className="text-[11px] cursor-pointer" htmlFor="lockClothing">
                     Travar Roupa
                   </Label>
                 </div>
                 <Switch
                   id="lockClothing"
                   checked={profile.lockClothing !== false}
                   onCheckedChange={(checked) => {
                     onProfileChange({ 
                       ...profile, 
                       lockClothing: checked,
                       lockPhysicalOnly: checked ? profile.lockPhysicalOnly : false
                     });
                   }}
                 />
               </div>
               
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <UserCheck className="w-3.5 h-3.5 text-accent" />
                   <Label className="text-[11px] cursor-pointer" htmlFor="lockPhysicalOnly">
                     Só Físico (roupa varia)
                   </Label>
                 </div>
                 <Switch
                   id="lockPhysicalOnly"
                   checked={profile.lockPhysicalOnly || false}
                   onCheckedChange={(checked) => {
                     onProfileChange({ 
                       ...profile, 
                       lockPhysicalOnly: checked,
                       lockClothing: checked ? false : profile.lockClothing
                     });
                   }}
                 />
               </div>
               
               <p className="text-[9px] text-muted-foreground pt-1 border-t border-border/50">
                 {profile.lockPhysicalOnly 
                   ? "🎭 Rosto/cabelo/corpo ficam iguais, roupa pode mudar entre cenas"
                   : profile.lockClothing !== false
                     ? "🔒 Personagem inteiro travado (físico + roupa)"
                     : "🔓 Nenhum travamento ativo"
                 }
               </p>
             </div>

            {!useStructuredMode ? (
              <>
                <div>
                  <Label className="text-xs">Prompt Base (Descrição Visual)</Label>
                  <Textarea
                    value={profile.basePrompt}
                    onChange={(e) => onProfileChange({ ...profile, basePrompt: e.target.value })}
                    className="mt-1 min-h-[120px] text-xs font-mono"
                    placeholder="Descrição detalhada do personagem..."
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    💡 Inclua detalhes como idade, roupas, características físicas e expressões.
                    Termine com um identificador único entre colchetes para consistência.
                  </p>
                </div>
                <div>
                  <Label className="text-xs">Estilo Visual</Label>
                  <Input
                    value={profile.visualStyle}
                    onChange={(e) => onProfileChange({ ...profile, visualStyle: e.target.value })}
                    className="mt-1 h-8"
                    placeholder="Ex: Cinematográfico, tons dessaturados..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => setIsEditing(false)} className="flex-1">
                    Salvar
                  </Button>
                  <Button size="sm" variant="outline" onClick={resetToDefault}>
                    Restaurar Padrão
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Modo Estruturado — campos detalhados */}
                 <div className="p-2.5 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 space-y-2">
                   <div className="flex items-center gap-2">
                     <Sparkles className="w-3.5 h-3.5 text-primary" />
                     <p className="text-[10px] text-primary font-medium">
                       Preencher com IA
                     </p>
                   </div>
                   <div className="flex gap-2">
                     <Input
                       value={aiDescription}
                       onChange={(e) => setAiDescription(e.target.value)}
                       placeholder="Ex: homem latino, 35 anos, sobrevivente, visual desgastado..."
                       className="h-7 text-xs flex-1"
                       disabled={isGeneratingWithAI}
                     />
                     <Button
                       size="sm"
                       variant="default"
                       className="h-7 px-3 text-[10px]"
                       onClick={fillWithAI}
                       disabled={isGeneratingWithAI || !aiDescription.trim()}
                     >
                       {isGeneratingWithAI ? (
                         <Loader2 className="w-3 h-3 animate-spin" />
                       ) : (
                         <>
                           <Sparkles className="w-3 h-3 mr-1" />
                           Gerar
                         </>
                       )}
                     </Button>
                   </div>
                   <p className="text-[9px] text-muted-foreground">
                     Digite uma descrição simples e a IA preencherá todos os campos automaticamente.
                   </p>
                </div>

                <Accordion type="multiple" className="w-full" defaultValue={["face", "hair", "clothes"]}>
                  {/* Rosto */}
                  <AccordionItem value="face">
                    <AccordionTrigger className="text-xs py-2">
                      <span className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-primary" />
                        Rosto e Pele
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2 pt-1">
                      {(["faceShape", "skinTone", "eyeColor", "eyeShape", "eyebrows", "nose", "lips", "facialHair", "facialMarks"] as const).map((key) => (
                        <div key={key}>
                          <Label className="text-[10px] capitalize">{key.replace(/([A-Z])/g, " $1")}</Label>
                          <Input
                            value={localDetails[key] || ""}
                            onChange={(e) => updateDetail(key, e.target.value)}
                            placeholder={DETAIL_PLACEHOLDERS[key]}
                            className="h-7 text-xs mt-0.5"
                          />
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>

                  {/* Cabelo */}
                  <AccordionItem value="hair">
                    <AccordionTrigger className="text-xs py-2">
                      <span className="flex items-center gap-2">
                        <Palette className="w-3.5 h-3.5 text-primary" />
                        Cabelo
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2 pt-1">
                      {(["hairColor", "hairLength", "hairStyle", "hairTexture"] as const).map((key) => (
                        <div key={key}>
                          <Label className="text-[10px] capitalize">{key.replace(/([A-Z])/g, " $1")}</Label>
                          <Input
                            value={localDetails[key] || ""}
                            onChange={(e) => updateDetail(key, e.target.value)}
                            placeholder={DETAIL_PLACEHOLDERS[key]}
                            className="h-7 text-xs mt-0.5"
                          />
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>

                  {/* Corpo */}
                  <AccordionItem value="body">
                    <AccordionTrigger className="text-xs py-2">
                      <span className="flex items-center gap-2">
                        <Footprints className="w-3.5 h-3.5 text-primary" />
                        Corpo e Idade
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2 pt-1">
                      {(["age", "height", "bodyType", "posture"] as const).map((key) => (
                        <div key={key}>
                          <Label className="text-[10px] capitalize">{key.replace(/([A-Z])/g, " $1")}</Label>
                          <Input
                            value={localDetails[key] || ""}
                            onChange={(e) => updateDetail(key, e.target.value)}
                            placeholder={DETAIL_PLACEHOLDERS[key]}
                            className="h-7 text-xs mt-0.5"
                          />
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>

                  {/* Roupas */}
                  <AccordionItem value="clothes">
                    <AccordionTrigger className="text-xs py-2">
                      <span className="flex items-center gap-2">
                        <Shirt className="w-3.5 h-3.5 text-primary" />
                        Roupas
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2 pt-1">
                      {(["outerLayer", "topClothing", "bottomClothing", "footwear"] as const).map((key) => (
                        <div key={key}>
                          <Label className="text-[10px] capitalize">{key.replace(/([A-Z])/g, " $1")}</Label>
                          <Input
                            value={localDetails[key] || ""}
                            onChange={(e) => updateDetail(key, e.target.value)}
                            placeholder={DETAIL_PLACEHOLDERS[key]}
                            className="h-7 text-xs mt-0.5"
                          />
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>

                  {/* Acessórios */}
                  <AccordionItem value="accessories">
                    <AccordionTrigger className="text-xs py-2">
                      <span className="flex items-center gap-2">
                        <Glasses className="w-3.5 h-3.5 text-primary" />
                        Acessórios
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2 pt-1">
                      {(["accessories", "jewelry", "headwear"] as const).map((key) => (
                        <div key={key}>
                          <Label className="text-[10px] capitalize">{key.replace(/([A-Z])/g, " $1")}</Label>
                          <Input
                            value={localDetails[key] || ""}
                            onChange={(e) => updateDetail(key, e.target.value)}
                            placeholder={DETAIL_PLACEHOLDERS[key]}
                            className="h-7 text-xs mt-0.5"
                          />
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>

                  {/* Expressão e Comportamento */}
                  <AccordionItem value="expression">
                    <AccordionTrigger className="text-xs py-2">
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                        Expressão e Marcas
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2 pt-1">
                      {(["defaultExpression", "bodyLanguage", "distinctiveFeatures", "characterId"] as const).map((key) => (
                        <div key={key}>
                          <Label className="text-[10px] capitalize">{key.replace(/([A-Z])/g, " $1")}</Label>
                          <Input
                            value={localDetails[key] || ""}
                            onChange={(e) => updateDetail(key, e.target.value)}
                            placeholder={DETAIL_PLACEHOLDERS[key]}
                            className="h-7 text-xs mt-0.5"
                          />
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <Separator />

                <div>
                  <Label className="text-xs">Estilo Visual</Label>
                  <Input
                    value={profile.visualStyle}
                    onChange={(e) => onProfileChange({ ...profile, visualStyle: e.target.value })}
                    className="mt-1 h-8"
                    placeholder="Ex: Cinematográfico, tons dessaturados..."
                  />
                </div>

                <div className="flex gap-2">
                  <Button size="sm" onClick={applyStructuredDetails} className="flex-1">
                    Gerar Prompt e Salvar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setUseStructuredMode(false)}>
                    Cancelar
                  </Button>
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            {/* Preview Toggle */}
            <Collapsible open={showPreview} onOpenChange={setShowPreview}>
              <CollapsibleTrigger asChild>
                <button className="w-full flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <span className="text-[10px] font-medium flex items-center gap-1.5">
                    {showPreview ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {showPreview ? "Ocultar Prompt" : "Ver Prompt Base"}
                  </span>
                  <Badge variant="outline" className="text-[9px] h-4">
                    {profile.basePrompt.length} chars
                  </Badge>
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2 p-2 rounded-lg bg-muted/30 border border-border">
                  <p className="text-[10px] font-mono text-muted-foreground leading-relaxed">
                    {profile.basePrompt}
                  </p>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Visual Style */}
            {profile.visualStyle && (
              <div className="flex items-start gap-2 p-2 rounded-lg bg-primary/5 border border-primary/20">
                <Sparkles className="w-3.5 h-3.5 text-primary mt-0.5" />
                <div>
                  <p className="text-[10px] font-medium">Estilo Visual</p>
                  <p className="text-[10px] text-muted-foreground">
                    {profile.visualStyle}
                  </p>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-7 text-[10px]"
                onClick={copyToClipboard}
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 mr-1" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 mr-1" />
                    Copiar Prompt
                  </>
                )}
              </Button>
            </div>

            {/* Consistency Tip */}
            <div className="p-2 rounded-lg bg-accent/10 border border-accent/20">
              <p className="text-[10px] text-accent font-medium">💡 Dica de Consistência</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Mantenha o personagem bloqueado para que ele seja incluído automaticamente 
                em todos os prompts gerados, garantindo consistência visual nos vídeos de 8s.
              </p>
            </div>
              
            {/* Generated Images Preview */}
            {lastResult && lastResult.images.length > 0 && (
              <Collapsible open={showImageGenerator} onOpenChange={setShowImageGenerator}>
                <CollapsibleTrigger asChild>
                  <button className="w-full flex items-center justify-between p-2 rounded-lg bg-primary/10 hover:bg-primary/15 transition-colors">
                    <span className="text-[10px] font-medium flex items-center gap-1.5">
                      <ImagePlus className="w-3 h-3 text-primary" />
                      Imagens Geradas ({lastResult.images.length})
                    </span>
                    <Badge variant="outline" className="text-[9px] h-4">
                      Seed: {lastResult.seed}
                    </Badge>
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-2 grid grid-cols-4 gap-1.5">
                    {lastResult.images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => onProfileChange({ 
                          ...profile, 
                          avatarUrl: img, 
                          avatarSeed: lastResult.seed 
                        })}
                        className={cn(
                          "relative rounded-lg overflow-hidden border-2 transition-all hover:scale-105",
                          profile.avatarUrl === img 
                            ? "border-primary ring-2 ring-primary/30" 
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <img 
                          src={img} 
                          alt={`Avatar option ${index + 1}`}
                          className="w-full aspect-square object-cover"
                        />
                        {profile.avatarUrl === img && (
                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                            <Check className="w-4 h-4 text-primary" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2 text-center">
                    Clique em uma imagem para usar como avatar
                  </p>
                </CollapsibleContent>
              </Collapsible>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}