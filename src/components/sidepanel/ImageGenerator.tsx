 import { useState } from 'react';
 import { motion, AnimatePresence } from 'framer-motion';
 import { 
   ImagePlus, 
   Wand2, 
   Download, 
   Copy, 
   Check,
   RefreshCw,
   Loader2,
   AlertCircle,
   Settings,
   Sparkles
 } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Textarea } from '@/components/ui/textarea';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Badge } from '@/components/ui/badge';
 import { useImageFxGeneration } from '@/hooks/useImageFxGeneration';
 import { useCredentials } from '@/hooks/useCredentials';
 import { cn } from '@/lib/utils';
 
 interface ImageGeneratorProps {
   initialPrompt?: string;
   onImageSelect?: (imageUrl: string) => void;
   compact?: boolean;
 }
 
 export function ImageGenerator({ 
   initialPrompt = '', 
   onImageSelect,
   compact = false 
 }: ImageGeneratorProps) {
   const [prompt, setPrompt] = useState(initialPrompt);
   const [seed, setSeed] = useState<string>('');
   const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
   const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
 
   const { generate, isGenerating, error, lastResult } = useImageFxGeneration();
   const { hasImageFxCookies } = useCredentials();
 
   const handleGenerate = async () => {
     if (!prompt.trim()) return;
     await generate(prompt.trim(), seed ? parseInt(seed) : undefined);
   };
 
   const handleRegenerate = async () => {
     if (!prompt.trim()) return;
     // Regenerate with same seed for consistency
     await generate(prompt.trim(), lastResult?.seed);
   };
 
   const downloadImage = (imageUrl: string, index: number) => {
     const link = document.createElement('a');
     link.href = imageUrl;
     link.download = `imagefx-${Date.now()}-${index + 1}.png`;
     link.click();
   };
 
   const copyImageToClipboard = async (imageUrl: string, index: number) => {
     try {
       const response = await fetch(imageUrl);
       const blob = await response.blob();
       await navigator.clipboard.write([
         new ClipboardItem({ 'image/png': blob })
       ]);
       setCopiedIndex(index);
       setTimeout(() => setCopiedIndex(null), 2000);
     } catch (err) {
       console.error('Failed to copy image:', err);
     }
   };
 
   if (!hasImageFxCookies) {
     return (
       <div className="p-4 rounded-xl border border-dashed border-border bg-muted/30">
         <div className="flex flex-col items-center text-center gap-3">
           <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
             <Settings className="w-6 h-6 text-muted-foreground" />
           </div>
           <div>
             <p className="text-sm font-medium">Cookies não configurados</p>
             <p className="text-xs text-muted-foreground mt-1">
               Configure seus cookies do ImageFX na aba Configurações para gerar imagens.
             </p>
           </div>
         </div>
       </div>
     );
   }
 
   return (
     <motion.div
       initial={{ opacity: 0, y: 10 }}
       animate={{ opacity: 1, y: 0 }}
       className="space-y-4"
     >
       {/* Prompt Input */}
       <div className="space-y-2">
         <Label className="text-xs font-medium flex items-center gap-2">
           <Wand2 className="w-3.5 h-3.5 text-primary" />
           Prompt de Geração
         </Label>
         <Textarea
           value={prompt}
           onChange={(e) => setPrompt(e.target.value)}
           placeholder="Descreva a imagem que deseja gerar..."
           className={cn(
             "text-xs font-mono resize-none",
             compact ? "min-h-[80px]" : "min-h-[120px]"
           )}
         />
       </div>
 
       {/* Seed Input */}
       <div className="flex items-center gap-2">
         <div className="flex-1">
           <Label className="text-[10px] text-muted-foreground mb-1 block">
             Seed (opcional - para consistência)
           </Label>
           <Input
             value={seed}
             onChange={(e) => setSeed(e.target.value.replace(/\D/g, ''))}
             placeholder="Ex: 123456789"
             className="h-8 text-xs font-mono"
           />
         </div>
         {lastResult?.seed && (
           <Badge variant="outline" className="text-[10px] h-6 mt-4">
             Último: {lastResult.seed}
           </Badge>
         )}
       </div>
 
       {/* Generate Button */}
       <div className="flex gap-2">
         <Button
           onClick={handleGenerate}
           disabled={isGenerating || !prompt.trim()}
           className="flex-1"
           variant="glow"
         >
           {isGenerating ? (
             <>
               <Loader2 className="w-4 h-4 mr-2 animate-spin" />
               Gerando...
             </>
           ) : (
             <>
               <ImagePlus className="w-4 h-4 mr-2" />
               Gerar Imagens
             </>
           )}
         </Button>
         
         {lastResult && lastResult.images.length > 0 && (
           <Button
             onClick={handleRegenerate}
             disabled={isGenerating}
             variant="outline"
             size="icon"
             title="Regenerar com mesma seed"
           >
             <RefreshCw className={cn("w-4 h-4", isGenerating && "animate-spin")} />
           </Button>
         )}
       </div>
 
       {/* Error Display */}
       <AnimatePresence>
         {error && (
           <motion.div
             initial={{ opacity: 0, height: 0 }}
             animate={{ opacity: 1, height: 'auto' }}
             exit={{ opacity: 0, height: 0 }}
             className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 flex items-start gap-2"
           >
             <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
             <p className="text-xs text-destructive">{error}</p>
           </motion.div>
         )}
       </AnimatePresence>
 
       {/* Generated Images */}
       <AnimatePresence>
         {lastResult && lastResult.images.length > 0 && (
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -20 }}
             className="space-y-3"
           >
             <div className="flex items-center justify-between">
               <Label className="text-xs font-medium flex items-center gap-2">
                 <Sparkles className="w-3.5 h-3.5 text-accent" />
                 Imagens Geradas
               </Label>
               <Badge variant="secondary" className="text-[10px]">
                 {lastResult.images.length} imagens
               </Badge>
             </div>
 
             <div className={cn(
               "grid gap-2",
               compact ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4"
             )}>
               {lastResult.images.map((img, index) => (
                 <motion.div
                   key={index}
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   transition={{ delay: index * 0.1 }}
                   className={cn(
                     "relative group rounded-lg overflow-hidden border transition-all cursor-pointer",
                     selectedIndex === index 
                       ? "border-primary ring-2 ring-primary/30" 
                       : "border-border hover:border-primary/50"
                   )}
                   onClick={() => {
                     setSelectedIndex(index);
                     onImageSelect?.(img);
                   }}
                 >
                   <img
                     src={img}
                     alt={`Generated ${index + 1}`}
                     className="w-full aspect-square object-cover"
                   />
                   
                   {/* Overlay Actions */}
                   <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                     <Button
                       size="icon"
                       variant="secondary"
                       className="h-8 w-8"
                       onClick={(e) => {
                         e.stopPropagation();
                         downloadImage(img, index);
                       }}
                     >
                       <Download className="w-4 h-4" />
                     </Button>
                     <Button
                       size="icon"
                       variant="secondary"
                       className="h-8 w-8"
                       onClick={(e) => {
                         e.stopPropagation();
                         copyImageToClipboard(img, index);
                       }}
                     >
                       {copiedIndex === index ? (
                         <Check className="w-4 h-4 text-accent" />
                       ) : (
                         <Copy className="w-4 h-4" />
                       )}
                     </Button>
                   </div>
 
                   {/* Selection Indicator */}
                   {selectedIndex === index && (
                     <div className="absolute top-2 right-2">
                       <Badge className="text-[10px] h-5 bg-primary">
                         <Check className="w-3 h-3 mr-1" />
                         Selecionada
                       </Badge>
                     </div>
                   )}
 
                   {/* Index Badge */}
                   <div className="absolute bottom-2 left-2">
                     <Badge variant="outline" className="text-[10px] h-5 bg-background/80">
                       #{index + 1}
                     </Badge>
                   </div>
                 </motion.div>
               ))}
             </div>
 
             {/* Seed Info */}
             <div className="p-2 rounded-lg bg-muted/50 border border-border">
               <p className="text-[10px] text-muted-foreground flex items-center gap-2">
                 <span className="font-medium">Seed utilizada:</span>
                 <code className="px-1.5 py-0.5 bg-muted rounded text-foreground">
                   {lastResult.seed}
                 </code>
                 <span className="text-muted-foreground/60">
                   (salve para manter consistência)
                 </span>
               </p>
             </div>
           </motion.div>
         )}
       </AnimatePresence>
     </motion.div>
   );
 }