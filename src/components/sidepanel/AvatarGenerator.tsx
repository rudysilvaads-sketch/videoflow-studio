 import { useState } from "react";
 import { motion } from "framer-motion";
 import { 
   ImagePlus, 
   Loader2, 
   RefreshCw, 
   Check,
   AlertCircle,
   Sparkles,
   Lock
 } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { supabase } from "@/integrations/supabase/client";
 import { toast } from "sonner";
 import { cn } from "@/lib/utils";
 
 interface AvatarGeneratorProps {
   characterName: string;
   basePrompt: string;
   currentImageUrl?: string;
   onImageGenerated: (imageUrl: string) => void;
   disabled?: boolean;
 }
 
 export function AvatarGenerator({
   characterName,
   basePrompt,
   currentImageUrl,
   onImageGenerated,
   disabled = false
 }: AvatarGeneratorProps) {
   const [isGenerating, setIsGenerating] = useState(false);
   const [generatedImages, setGeneratedImages] = useState<string[]>([]);
   const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
   const [error, setError] = useState<string | null>(null);
 
   const getCookies = () => {
     try {
       const stored = localStorage.getItem('lacasadark_credentials');
       if (stored) {
         const creds = JSON.parse(stored);
        // Prefer the canonical key used by SettingsTab/useCredentials
        return creds.imageFxCookies || creds.imagefxCookies || '';
       }
     } catch {
       return '';
     }
     return '';
   };
 
   const generateAvatar = async () => {
     const cookies = getCookies();
     
     if (!cookies) {
       toast.error("Configure os cookies do ImageFX nas configurações");
       return;
     }
 
     setIsGenerating(true);
     setError(null);
     setGeneratedImages([]);
     setSelectedIndex(null);
 
     try {
       // Build avatar-specific prompt
       const avatarPrompt = `Portrait of ${characterName}, ${basePrompt}, centered composition, portrait photography, studio lighting, high quality, detailed face, professional headshot, 4k`;
       
       const { data, error: fnError } = await supabase.functions.invoke('generate-imagefx', {
         body: { 
           prompt: avatarPrompt,
           cookies 
         }
       });
 
       if (fnError) {
         throw new Error(fnError.message);
       }
 
       if (data?.error) {
         if (data.code === 'COOKIES_EXPIRED') {
           setError('Cookies expirados. Atualize nas configurações.');
         } else {
           setError(data.error);
         }
         return;
       }
 
       if (data?.images && data.images.length > 0) {
         setGeneratedImages(data.images);
         toast.success(`${data.images.length} imagens geradas!`);
       } else {
         setError('Nenhuma imagem foi gerada');
       }
     } catch (err) {
       console.error('Avatar generation error:', err);
       setError(err instanceof Error ? err.message : 'Erro ao gerar avatar');
       toast.error("Erro ao gerar avatar");
     } finally {
       setIsGenerating(false);
     }
   };
 
   const selectImage = (index: number) => {
     setSelectedIndex(index);
     onImageGenerated(generatedImages[index]);
     toast.success("Avatar selecionado!");
   };
 
   const hasCookies = !!getCookies();
 
   return (
     <div className="space-y-4">
       {/* Current Avatar Preview */}
       <div className="flex items-center gap-4">
         <div className="relative">
           {currentImageUrl ? (
             <img 
               src={currentImageUrl} 
               alt={characterName}
               className="w-20 h-20 rounded-xl object-cover ring-2 ring-border"
             />
           ) : (
             <div className="w-20 h-20 rounded-xl bg-muted flex items-center justify-center">
               <ImagePlus className="w-8 h-8 text-muted-foreground" />
             </div>
           )}
           {currentImageUrl && (
             <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-accent text-accent-foreground">
               <Lock className="w-3 h-3" />
             </div>
           )}
         </div>
         
         <div className="flex-1">
           <h4 className="text-sm font-medium mb-1">Avatar do Personagem</h4>
           <p className="text-xs text-muted-foreground mb-2">
             {currentImageUrl 
               ? "Imagem travada para consistência nas cenas" 
               : "Gere uma imagem para travar nas cenas"}
           </p>
           
           <Button
             size="sm"
             variant={currentImageUrl ? "outline" : "default"}
             onClick={generateAvatar}
             disabled={isGenerating || disabled || !hasCookies}
             className="h-8 text-xs gap-2"
           >
             {isGenerating ? (
               <>
                 <Loader2 className="w-3 h-3 animate-spin" />
                 Gerando...
               </>
             ) : (
               <>
                 <Sparkles className="w-3 h-3" />
                 {currentImageUrl ? "Gerar Novo" : "Gerar Avatar"}
               </>
             )}
           </Button>
           
           {!hasCookies && (
             <p className="text-[10px] text-destructive mt-1">
               Configure os cookies do ImageFX
             </p>
           )}
         </div>
       </div>
 
       {/* Error State */}
       {error && (
         <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
           <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
           <p className="text-xs text-destructive">{error}</p>
         </div>
       )}
 
       {/* Generated Images Grid */}
       {generatedImages.length > 0 && (
         <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           className="space-y-2"
         >
           <p className="text-xs text-muted-foreground">
             Selecione uma imagem para usar:
           </p>
           <div className="grid grid-cols-4 gap-2">
             {generatedImages.map((img, idx) => (
               <motion.button
                 key={idx}
                 whileHover={{ scale: 1.05 }}
                 whileTap={{ scale: 0.95 }}
                 onClick={() => selectImage(idx)}
                 className={cn(
                   "relative aspect-square rounded-lg overflow-hidden border-2 transition-all",
                   selectedIndex === idx 
                     ? "border-accent ring-2 ring-accent/30" 
                     : "border-border hover:border-primary/50"
                 )}
               >
                 <img 
                   src={img} 
                   alt={`Opção ${idx + 1}`}
                   className="w-full h-full object-cover"
                 />
                 {selectedIndex === idx && (
                   <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
                     <Check className="w-6 h-6 text-accent" />
                   </div>
                 )}
               </motion.button>
             ))}
           </div>
           
           <Button
             size="sm"
             variant="ghost"
             onClick={generateAvatar}
             disabled={isGenerating}
             className="w-full h-8 text-xs gap-2"
           >
             <RefreshCw className={cn("w-3 h-3", isGenerating && "animate-spin")} />
             Gerar Novas Opções
           </Button>
         </motion.div>
       )}
     </div>
   );
 }