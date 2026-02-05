 import { useState, useMemo } from "react";
 import { motion, AnimatePresence } from "framer-motion";
 import {
   Film,
   Plus,
   Trash2,
   Play,
   Clock,
   Layers,
   ChevronDown,
   ChevronUp,
   Sparkles,
   Loader2,
   Copy,
   Check,
   Edit3,
   Save,
   X,
   GripVertical,
   AlertCircle,
   Bookmark,
   Download,
   Upload,
   Star
 } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Textarea } from "@/components/ui/textarea";
 import { Label } from "@/components/ui/label";
 import { Badge } from "@/components/ui/badge";
 import { ScrollArea } from "@/components/ui/scroll-area";
 import { Separator } from "@/components/ui/separator";
 import {
   Collapsible,
   CollapsibleContent,
   CollapsibleTrigger,
 } from "@/components/ui/collapsible";
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from "@/components/ui/select";
 import { 
   Episode, 
   NarrativeBeat, 
   EpisodeScene, 
   BEAT_TEMPLATES,
   EpisodeStats,
   EPISODE_TEMPLATES,
   EpisodeTemplate
 } from "@/types/episode";
 import { supabase } from "@/integrations/supabase/client";
 import { toast } from "sonner";
 import { EpisodeTimeline } from "./EpisodeTimeline";
 import { useCustomEpisodeTemplates } from "@/hooks/useCustomEpisodeTemplates";
 
 interface EpisodeManagerProps {
   characterPrompt: string;
   visualStyle: string;
   onSendToQueue: (prompts: string[]) => void;
 }
 
 export function EpisodeManager({ characterPrompt, visualStyle, onSendToQueue }: EpisodeManagerProps) {
   const [episode, setEpisode] = useState<Episode | null>(null);
   const [isCreating, setIsCreating] = useState(false);
   const [isGenerating, setIsGenerating] = useState(false);
   const [expandedBeats, setExpandedBeats] = useState<string[]>([]);
   const [editingScene, setEditingScene] = useState<string | null>(null);
   const [copiedScene, setCopiedScene] = useState<string | null>(null);
   const [selectedTimelineBeat, setSelectedTimelineBeat] = useState<string | null>(null);
   const [showTemplates, setShowTemplates] = useState(true);
   const [templateTab, setTemplateTab] = useState<'builtin' | 'custom'>('builtin');
 
   const { 
     customTemplates, 
     saveTemplate, 
     deleteTemplate,
     exportTemplates,
     importTemplates 
   } = useCustomEpisodeTemplates();
 
   // Form state para novo episódio
   const [formData, setFormData] = useState({
     title: "",
     description: "",
     targetDuration: 10,
     sceneDuration: 8,
   });
   const [selectedBeats, setSelectedBeats] = useState<{
     name: string;
     description: string;
     emotionalTone: string;
     location: string;
     sceneCount: number;
   }[]>([]);
 
   // Estatísticas do episódio
   const stats = useMemo((): EpisodeStats | null => {
     if (!episode) return null;
     const totalScenes = episode.beats.reduce((acc, b) => acc + b.scenes.length, 0);
     const completedScenes = episode.beats.reduce(
       (acc, b) => acc + b.scenes.filter(s => s.status === 'completed').length, 0
     );
     const totalDuration = totalScenes * episode.sceneDuration;
     return {
       totalScenes,
       completedScenes,
       totalDuration,
       estimatedMinutes: Math.round(totalDuration / 60 * 10) / 10,
     };
   }, [episode]);
 
   const addBeatTemplate = (template: typeof BEAT_TEMPLATES[0]) => {
     const targetScenes = Math.ceil((formData.targetDuration * 60) / formData.sceneDuration / 6);
     setSelectedBeats(prev => [...prev, {
       ...template,
       location: "",
       sceneCount: targetScenes,
     }]);
   };
 
   const updateBeat = (index: number, field: string, value: string | number) => {
     setSelectedBeats(prev => prev.map((b, i) => 
       i === index ? { ...b, [field]: value } : b
     ));
   };
 
   const removeBeat = (index: number) => {
     setSelectedBeats(prev => prev.filter((_, i) => i !== index));
   };
 
   const createEpisode = () => {
     if (!formData.title.trim()) {
       toast.error("Digite um título para o episódio");
       return;
     }
     if (selectedBeats.length === 0) {
       toast.error("Adicione pelo menos um beat narrativo");
       return;
     }
 
     const newEpisode: Episode = {
       id: crypto.randomUUID(),
       title: formData.title,
       description: formData.description,
       targetDuration: formData.targetDuration,
       sceneDuration: formData.sceneDuration,
       visualStyle,
       beats: selectedBeats.map((b, i) => ({
         id: crypto.randomUUID(),
         name: b.name,
         description: b.description,
         emotionalTone: b.emotionalTone,
         location: b.location,
         scenes: [],
         order: i,
         targetSceneCount: b.sceneCount,
       })),
       createdAt: new Date(),
       updatedAt: new Date(),
     };
 
     setEpisode(newEpisode);
     setIsCreating(false);
     setExpandedBeats(newEpisode.beats.map(b => b.id));
   };
 
   const generateScenes = async () => {
     if (!episode) return;
     if (!characterPrompt.trim()) {
       toast.error("Configure o personagem antes de gerar cenas");
       return;
     }
 
     setIsGenerating(true);
     try {
       const beatsData = episode.beats.map(b => ({
         name: b.name,
         description: b.description,
         emotionalTone: b.emotionalTone,
         location: b.location,
         sceneCount: b.targetSceneCount || 8,
       }));
       
       console.log("Sending beats data:", beatsData);
 
       const { data, error } = await supabase.functions.invoke('generate-episode-scenes', {
         body: {
           episodeTitle: episode.title,
           episodeDescription: episode.description,
           beats: beatsData,
           characterPrompt,
           visualStyle: episode.visualStyle || visualStyle,
           sceneDuration: episode.sceneDuration,
         }
       });
 
       if (error) throw error;
       if (data.error) throw new Error(data.error);
 
       console.log("Received data from edge function:", data);
 
       // Atualizar beats com as cenas geradas
       const updatedBeats = episode.beats.map((beat, beatIndex) => {
         const generatedBeat = data.beats?.[beatIndex];
         if (!generatedBeat) {
           console.log(`No generated beat for index ${beatIndex}`);
           return beat;
         }
 
         console.log(`Beat ${beatIndex} has ${generatedBeat.scenes?.length || 0} scenes`);
 
         return {
           ...beat,
           scenes: generatedBeat.scenes.map((s: { prompt: string; notes?: string }, sceneIndex: number) => ({
             id: crypto.randomUUID(),
             beatId: beat.id,
             prompt: s.prompt,
             sceneNumber: sceneIndex + 1,
             status: 'pending' as const,
             notes: s.notes,
           })),
         };
       });
 
       console.log("Updated beats:", updatedBeats.map(b => ({ name: b.name, sceneCount: b.scenes.length })));
       
       const updatedEpisode = { ...episode, beats: updatedBeats, updatedAt: new Date() };
       setEpisode(updatedEpisode);
       toast.success("Cenas geradas com sucesso!");
     } catch (err) {
       console.error("Error generating scenes:", err);
       toast.error(err instanceof Error ? err.message : "Erro ao gerar cenas");
     } finally {
       setIsGenerating(false);
     }
   };
 
   const updateScenePrompt = (beatId: string, sceneId: string, newPrompt: string) => {
     if (!episode) return;
     setEpisode(prev => {
       if (!prev) return null;
       return {
         ...prev,
         beats: prev.beats.map(b => 
           b.id === beatId ? {
             ...b,
             scenes: b.scenes.map(s => 
               s.id === sceneId ? { ...s, prompt: newPrompt } : s
             )
           } : b
         ),
         updatedAt: new Date(),
       };
     });
     setEditingScene(null);
   };
 
   const copyScenePrompt = (sceneId: string, prompt: string) => {
     navigator.clipboard.writeText(prompt);
     setCopiedScene(sceneId);
     setTimeout(() => setCopiedScene(null), 2000);
   };
 
   const sendAllToQueue = () => {
     if (!episode) return;
     const allPrompts = episode.beats
       .flatMap(b => b.scenes)
       .sort((a, b) => a.sceneNumber - b.sceneNumber)
       .map(s => s.prompt);
     
     if (allPrompts.length === 0) {
       toast.error("Nenhuma cena para enviar");
       return;
     }
 
     onSendToQueue(allPrompts);
     toast.success(`${allPrompts.length} cenas enviadas para a fila!`);
   };
 
   const sendBeatToQueue = (beatId: string) => {
     if (!episode) return;
     const beat = episode.beats.find(b => b.id === beatId);
     if (!beat) return;
 
     const prompts = beat.scenes.map(s => s.prompt);
     onSendToQueue(prompts);
     toast.success(`${prompts.length} cenas de "${beat.name}" enviadas!`);
   };
 
   const handleTimelineBeatClick = (beatId: string) => {
     setSelectedTimelineBeat(prev => prev === beatId ? null : beatId);
     // Expandir o beat clicado na lista
     if (!expandedBeats.includes(beatId)) {
       setExpandedBeats(prev => [...prev, beatId]);
     }
   };
 
   const loadFromTemplate = (template: EpisodeTemplate) => {
     setFormData({
       title: template.title,
       description: template.description,
       targetDuration: template.targetDuration,
       sceneDuration: 8,
     });
     setSelectedBeats(template.beats.map(b => ({
       name: b.name,
       description: b.description,
       emotionalTone: b.emotionalTone,
       location: b.location || "",
       sceneCount: b.sceneCount,
     })));
     setShowTemplates(false);
   };
 
   const saveCurrentAsTemplate = () => {
     if (!formData.title.trim() || selectedBeats.length === 0) {
       toast.error("Preencha título e adicione beats antes de salvar");
       return;
     }
 
     const icons = ["📺", "🎬", "🎥", "📽️", "🎞️", "🎭", "🎪", "🎯"];
     const colors = [
       "from-violet-500 to-purple-600",
       "from-pink-500 to-rose-600", 
       "from-teal-500 to-cyan-600",
       "from-amber-500 to-orange-600",
     ];
 
     saveTemplate({
       title: formData.title,
       description: formData.description || "Template personalizado",
       icon: icons[Math.floor(Math.random() * icons.length)],
       color: colors[Math.floor(Math.random() * colors.length)],
       targetDuration: formData.targetDuration,
       beats: selectedBeats.map(b => ({
         name: b.name,
         description: b.description,
         emotionalTone: b.emotionalTone,
         sceneCount: b.sceneCount,
         location: b.location,
       })),
     });
 
     toast.success("Template salvo com sucesso!");
   };
 
   const handleImportTemplates = () => {
     const input = document.createElement("input");
     input.type = "file";
     input.accept = ".json";
     input.onchange = (e) => {
       const file = (e.target as HTMLInputElement).files?.[0];
       if (!file) return;
       const reader = new FileReader();
       reader.onload = (ev) => {
         const count = importTemplates(ev.target?.result as string);
         if (count > 0) {
           toast.success(`${count} templates importados!`);
         } else {
           toast.error("Erro ao importar templates");
         }
       };
       reader.readAsText(file);
     };
     input.click();
   };
 
   const totalScenesNeeded = Math.ceil((formData.targetDuration * 60) / formData.sceneDuration);
   const currentScenesPlanned = selectedBeats.reduce((acc, b) => acc + b.sceneCount, 0);
 
   // View: Criando novo episódio
   if (isCreating) {
     return (
       <motion.div
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         className="space-y-3"
       >
         <div className="flex items-center justify-between">
           <h3 className="text-sm font-semibold flex items-center gap-2">
             <Film className="w-4 h-4 text-primary" />
             Novo Episódio
           </h3>
           <Button variant="ghost" size="sm" onClick={() => setIsCreating(false)}>
             <X className="w-4 h-4" />
           </Button>
         </div>
 
         {/* Templates de Episódio */}
         {showTemplates && (
           <div className="space-y-2">
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-1">
                 <Button
                   variant={templateTab === 'builtin' ? 'default' : 'ghost'}
                   size="sm"
                   className="h-6 text-[10px] px-2"
                   onClick={() => setTemplateTab('builtin')}
                 >
                   <Sparkles className="w-3 h-3 mr-1" />
                   Padrão ({EPISODE_TEMPLATES.length})
                 </Button>
                 <Button
                   variant={templateTab === 'custom' ? 'default' : 'ghost'}
                   size="sm"
                   className="h-6 text-[10px] px-2"
                   onClick={() => setTemplateTab('custom')}
                 >
                   <Star className="w-3 h-3 mr-1" />
                   Meus ({customTemplates.length})
                 </Button>
               </div>
               <div className="flex items-center gap-1">
                 {templateTab === 'custom' && (
                   <>
                     <Button
                       variant="ghost"
                       size="sm"
                       className="h-5 w-5 p-0"
                       onClick={handleImportTemplates}
                       title="Importar"
                     >
                       <Upload className="w-3 h-3" />
                     </Button>
                     {customTemplates.length > 0 && (
                       <Button
                         variant="ghost"
                         size="sm"
                         className="h-5 w-5 p-0"
                         onClick={exportTemplates}
                         title="Exportar"
                       >
                         <Download className="w-3 h-3" />
                       </Button>
                     )}
                   </>
                 )}
                 <Button
                   variant="ghost"
                   size="sm"
                   className="h-5 text-[10px]"
                   onClick={() => setShowTemplates(false)}
                 >
                   <X className="w-3 h-3" />
                 </Button>
               </div>
             </div>
            
             {/* Templates Padrão */}
             {templateTab === 'builtin' && (
             <ScrollArea className="h-[180px]">
               <div className="grid grid-cols-2 gap-1.5 pr-2">
                 {EPISODE_TEMPLATES.map((template) => (
                   <motion.button
                     key={template.id}
                     whileHover={{ scale: 1.02 }}
                     whileTap={{ scale: 0.98 }}
                     onClick={() => loadFromTemplate(template)}
                     className="p-2 rounded-lg border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
                   >
                     <div className="flex items-center gap-1.5 mb-1">
                       <div className={`w-6 h-6 rounded-md flex items-center justify-center text-sm bg-gradient-to-br ${template.color}`}>
                         {template.icon}
                       </div>
                       <span className="text-[10px] font-medium truncate flex-1">{template.title}</span>
                     </div>
                     <p className="text-[9px] text-muted-foreground line-clamp-2">{template.description}</p>
                     <div className="flex items-center gap-1 mt-1">
                       <Badge variant="outline" className="text-[8px] h-4 px-1">
                         {template.targetDuration}min
                       </Badge>
                       <Badge variant="outline" className="text-[8px] h-4 px-1">
                         {template.beats.length} beats
                       </Badge>
                     </div>
                   </motion.button>
                 ))}
               </div>
             </ScrollArea>
             )}
 
             {/* Templates Personalizados */}
             {templateTab === 'custom' && (
               <ScrollArea className="h-[180px]">
                 {customTemplates.length === 0 ? (
                   <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                     <Bookmark className="w-8 h-8 text-muted-foreground/30 mb-2" />
                     <p className="text-[10px] text-muted-foreground">Nenhum template personalizado</p>
                     <p className="text-[9px] text-muted-foreground/70">Configure um episódio e clique em "Salvar como Template"</p>
                   </div>
                 ) : (
                   <div className="grid grid-cols-2 gap-1.5 pr-2">
                     {customTemplates.map((template) => (
                       <motion.div
                         key={template.id}
                         whileHover={{ scale: 1.02 }}
                         className="relative group"
                       >
                         <button
                           onClick={() => loadFromTemplate(template)}
                           className="w-full p-2 rounded-lg border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
                         >
                           <div className="flex items-center gap-1.5 mb-1">
                             <div className={`w-6 h-6 rounded-md flex items-center justify-center text-sm bg-gradient-to-br ${template.color}`}>
                               {template.icon}
                             </div>
                             <span className="text-[10px] font-medium truncate flex-1">{template.title}</span>
                           </div>
                           <p className="text-[9px] text-muted-foreground line-clamp-2">{template.description}</p>
                           <div className="flex items-center gap-1 mt-1">
                             <Badge variant="outline" className="text-[8px] h-4 px-1">
                               {template.targetDuration}min
                             </Badge>
                             <Badge variant="outline" className="text-[8px] h-4 px-1">
                               {template.beats.length} beats
                             </Badge>
                           </div>
                         </button>
                         <Button
                           variant="ghost"
                           size="sm"
                           className="absolute top-1 right-1 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80"
                           onClick={(e) => {
                             e.stopPropagation();
                             deleteTemplate(template.id);
                             toast.success("Template excluído");
                           }}
                         >
                           <Trash2 className="w-3 h-3 text-destructive" />
                         </Button>
                       </motion.div>
                     ))}
                   </div>
                 )}
               </ScrollArea>
             )}
            
             <Separator />
           </div>
         )}
 
         {!showTemplates && (
           <Button 
             variant="ghost" 
             size="sm" 
             className="h-6 text-[10px] w-full"
             onClick={() => setShowTemplates(true)}
           >
             <Sparkles className="w-3 h-3 mr-1" />
             Ver templates de episódio
           </Button>
         )}
 
         <div className="space-y-2">
           <Label className="text-xs">Título do Episódio</Label>
           <Input
             value={formData.title}
             onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
             placeholder="Ex: A Última Transmissão"
             className="h-8"
           />
         </div>
 
         <div className="space-y-2">
           <Label className="text-xs">Sinopse</Label>
           <Textarea
             value={formData.description}
             onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
             placeholder="Descreva o que acontece neste episódio..."
             className="min-h-[60px] text-xs"
           />
         </div>
 
         <div className="grid grid-cols-2 gap-2">
           <div className="space-y-1">
             <Label className="text-[10px]">Duração Alvo (min)</Label>
             <Select
               value={String(formData.targetDuration)}
               onValueChange={(v) => setFormData(prev => ({ ...prev, targetDuration: Number(v) }))}
             >
               <SelectTrigger className="h-7 text-xs">
                 <SelectValue />
               </SelectTrigger>
               <SelectContent>
                 {[8, 10, 12, 14, 16].map(n => (
                   <SelectItem key={n} value={String(n)}>{n} minutos</SelectItem>
                 ))}
               </SelectContent>
             </Select>
           </div>
           <div className="space-y-1">
             <Label className="text-[10px]">Duração/Cena (s)</Label>
             <Select
               value={String(formData.sceneDuration)}
               onValueChange={(v) => setFormData(prev => ({ ...prev, sceneDuration: Number(v) }))}
             >
               <SelectTrigger className="h-7 text-xs">
                 <SelectValue />
               </SelectTrigger>
               <SelectContent>
                 {[5, 6, 7, 8, 10].map(n => (
                   <SelectItem key={n} value={String(n)}>{n}s</SelectItem>
                 ))}
               </SelectContent>
             </Select>
           </div>
         </div>
 
         {/* Meta de cenas */}
         <div className="p-2 rounded-lg bg-muted/50 flex items-center justify-between">
           <span className="text-[10px] text-muted-foreground">Meta de cenas:</span>
           <Badge variant={currentScenesPlanned >= totalScenesNeeded ? "default" : "outline"}>
             {currentScenesPlanned} / {totalScenesNeeded} cenas
           </Badge>
         </div>
 
         <Separator />
 
         {/* Beats Templates */}
         <div className="space-y-2">
           <Label className="text-xs flex items-center gap-1">
             <Layers className="w-3 h-3" />
             Beats Narrativos
           </Label>
           <div className="flex flex-wrap gap-1">
             {BEAT_TEMPLATES.map((template) => (
               <Button
                 key={template.name}
                 variant="outline"
                 size="sm"
                 className="h-6 text-[10px] px-2"
                 onClick={() => addBeatTemplate(template)}
               >
                 <Plus className="w-2.5 h-2.5 mr-1" />
                 {template.name}
               </Button>
             ))}
           </div>
         </div>
 
         {/* Beats selecionados */}
         {selectedBeats.length > 0 && (
           <ScrollArea className="h-[180px]">
             <div className="space-y-2 pr-2">
               {selectedBeats.map((beat, index) => (
                 <div key={index} className="p-2 rounded-lg border border-border bg-card space-y-1.5">
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                       <GripVertical className="w-3 h-3 text-muted-foreground" />
                       <span className="text-xs font-medium">{index + 1}. {beat.name}</span>
                     </div>
                     <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => removeBeat(index)}>
                       <Trash2 className="w-3 h-3 text-destructive" />
                     </Button>
                   </div>
                   <p className="text-[9px] text-muted-foreground">{beat.description}</p>
                   <div className="grid grid-cols-2 gap-1.5">
                     <Input
                       value={beat.location}
                       onChange={(e) => updateBeat(index, 'location', e.target.value)}
                       placeholder="Localização..."
                       className="h-6 text-[10px]"
                     />
                     <div className="flex items-center gap-1">
                       <Input
                         type="number"
                         value={beat.sceneCount}
                         onChange={(e) => updateBeat(index, 'sceneCount', Number(e.target.value))}
                         className="h-6 text-[10px] w-14"
                         min={1}
                         max={30}
                       />
                       <span className="text-[9px] text-muted-foreground">cenas</span>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
           </ScrollArea>
         )}
 
         <div className="flex gap-2">
           <Button onClick={createEpisode} className="flex-1" disabled={selectedBeats.length === 0}>
             Criar Episódio
           </Button>
           <Button 
             variant="outline" 
             size="icon"
             onClick={saveCurrentAsTemplate}
             disabled={!formData.title.trim() || selectedBeats.length === 0}
             title="Salvar como Template"
           >
             <Bookmark className="w-4 h-4" />
           </Button>
         </div>
       </motion.div>
     );
   }
 
   // View: Episódio existente
   if (episode) {
     return (
       <motion.div
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         className="space-y-3"
       >
         {/* Header do episódio */}
         <div className="p-2.5 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
           <div className="flex items-center justify-between mb-1">
             <h3 className="text-sm font-semibold flex items-center gap-2">
               <Film className="w-4 h-4 text-primary" />
               {episode.title}
             </h3>
             <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setEpisode(null)}>
               <X className="w-3.5 h-3.5" />
             </Button>
           </div>
           
           {stats && (
             <div className="flex items-center gap-2 flex-wrap">
               <Badge variant="outline" className="text-[9px] h-5">
                 <Layers className="w-2.5 h-2.5 mr-1" />
                 {stats.totalScenes} cenas
               </Badge>
               <Badge variant="outline" className="text-[9px] h-5">
                 <Clock className="w-2.5 h-2.5 mr-1" />
                 ~{stats.estimatedMinutes} min
               </Badge>
               {stats.completedScenes > 0 && (
                 <Badge className="text-[9px] h-5">
                   {stats.completedScenes}/{stats.totalScenes} prontas
                 </Badge>
               )}
             </div>
           )}
         </div>
 
         {/* Ações principais */}
         <div className="flex gap-2">
           <Button
             size="sm"
             className="flex-1 h-8"
             onClick={generateScenes}
             disabled={isGenerating || !characterPrompt}
           >
             {isGenerating ? (
               <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
             ) : (
               <Sparkles className="w-3.5 h-3.5 mr-1" />
             )}
             {isGenerating ? "Gerando..." : "Gerar Cenas com IA"}
           </Button>
           {stats && stats.totalScenes > 0 && (
             <Button size="sm" variant="outline" className="h-8" onClick={sendAllToQueue}>
               <Play className="w-3.5 h-3.5 mr-1" />
               Enviar Todas
             </Button>
           )}
         </div>
 
         {!characterPrompt && (
           <div className="p-2 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center gap-2">
             <AlertCircle className="w-3.5 h-3.5 text-destructive" />
             <span className="text-[10px] text-destructive">Configure o personagem antes de gerar</span>
           </div>
         )}
 
         {/* Timeline Visual */}
         <EpisodeTimeline
           episode={episode}
           onBeatClick={handleTimelineBeatClick}
           selectedBeatId={selectedTimelineBeat || undefined}
         />
 
         {/* Lista de Beats */}
         <ScrollArea className="h-[200px]">
           <div className="space-y-2 pr-2">
             {episode.beats.map((beat, beatIndex) => (
               <Collapsible
                 key={beat.id}
                 open={expandedBeats.includes(beat.id)}
                 onOpenChange={(open) => {
                   setExpandedBeats(prev => 
                     open ? [...prev, beat.id] : prev.filter(id => id !== beat.id)
                   );
                 }}
               >
                 <div className="rounded-lg border border-border bg-card overflow-hidden">
                   <CollapsibleTrigger asChild>
                     <button className="w-full p-2 flex items-center justify-between hover:bg-muted/50 transition-colors">
                       <div className="flex items-center gap-2">
                         <Badge variant="outline" className="text-[9px] h-4 w-5 p-0 justify-center">
                           {beatIndex + 1}
                         </Badge>
                         <span className="text-xs font-medium">{beat.name}</span>
                         <Badge variant="secondary" className="text-[9px] h-4">
                           {beat.scenes.length} cenas
                         </Badge>
                       </div>
                       {expandedBeats.includes(beat.id) ? (
                         <ChevronUp className="w-3.5 h-3.5" />
                       ) : (
                         <ChevronDown className="w-3.5 h-3.5" />
                       )}
                     </button>
                   </CollapsibleTrigger>
                   
                   <CollapsibleContent>
                     <div className="px-2 pb-2 space-y-1.5">
                       <div className="flex items-center justify-between">
                         <p className="text-[9px] text-muted-foreground">{beat.emotionalTone}</p>
                         <Button 
                           variant="ghost" 
                           size="sm" 
                           className="h-5 text-[9px]"
                           onClick={() => sendBeatToQueue(beat.id)}
                           disabled={beat.scenes.length === 0}
                         >
                           <Play className="w-2.5 h-2.5 mr-1" />
                           Enviar Beat
                         </Button>
                       </div>
                       
                       {beat.scenes.length === 0 ? (
                         <p className="text-[10px] text-muted-foreground/50 italic py-2 text-center">
                           Clique em "Gerar Cenas com IA" para criar as cenas
                         </p>
                       ) : (
                         <div className="space-y-1">
                           {beat.scenes.map((scene, sceneIndex) => (
                             <div 
                               key={scene.id}
                               className="p-1.5 rounded bg-muted/30 border border-border/50"
                             >
                               <div className="flex items-start justify-between gap-1">
                                 <Badge variant="outline" className="text-[8px] h-4 shrink-0">
                                   {beatIndex + 1}.{sceneIndex + 1}
                                 </Badge>
                                 <div className="flex gap-0.5">
                                   <Button
                                     variant="ghost"
                                     size="sm"
                                     className="h-5 w-5 p-0"
                                     onClick={() => setEditingScene(editingScene === scene.id ? null : scene.id)}
                                   >
                                     <Edit3 className="w-2.5 h-2.5" />
                                   </Button>
                                   <Button
                                     variant="ghost"
                                     size="sm"
                                     className="h-5 w-5 p-0"
                                     onClick={() => copyScenePrompt(scene.id, scene.prompt)}
                                   >
                                     {copiedScene === scene.id ? (
                                       <Check className="w-2.5 h-2.5 text-green-500" />
                                     ) : (
                                       <Copy className="w-2.5 h-2.5" />
                                     )}
                                   </Button>
                                 </div>
                               </div>
                               
                               {editingScene === scene.id ? (
                                 <div className="mt-1 space-y-1">
                                   <Textarea
                                     defaultValue={scene.prompt}
                                     className="min-h-[60px] text-[10px]"
                                     id={`scene-${scene.id}`}
                                   />
                                   <div className="flex gap-1">
                                     <Button
                                       size="sm"
                                       className="h-5 text-[9px] flex-1"
                                       onClick={() => {
                                         const textarea = document.getElementById(`scene-${scene.id}`) as HTMLTextAreaElement;
                                         updateScenePrompt(beat.id, scene.id, textarea.value);
                                       }}
                                     >
                                       <Save className="w-2.5 h-2.5 mr-1" />
                                       Salvar
                                     </Button>
                                     <Button
                                       size="sm"
                                       variant="outline"
                                       className="h-5 text-[9px]"
                                       onClick={() => setEditingScene(null)}
                                     >
                                       Cancelar
                                     </Button>
                                   </div>
                                 </div>
                               ) : (
                                 <p className="text-[9px] text-muted-foreground mt-1 line-clamp-2">
                                   {scene.prompt}
                                 </p>
                               )}
                             </div>
                           ))}
                         </div>
                       )}
                     </div>
                   </CollapsibleContent>
                 </div>
               </Collapsible>
             ))}
           </div>
         </ScrollArea>
       </motion.div>
     );
   }
 
   // View: Nenhum episódio - mostrar botão criar
   return (
     <motion.div
       initial={{ opacity: 0 }}
       animate={{ opacity: 1 }}
       className="space-y-3"
     >
       <div className="p-4 rounded-lg border border-dashed border-border bg-muted/30 text-center">
         <Film className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
         <h3 className="text-sm font-medium mb-1">Gerenciador de Episódios</h3>
         <p className="text-[10px] text-muted-foreground mb-3">
           Organize seu vídeo em beats narrativos (8-16 min = 60-120 cenas de 8s)
         </p>
         <Button onClick={() => setIsCreating(true)}>
           <Plus className="w-4 h-4 mr-1" />
           Criar Episódio
         </Button>
       </div>
 
       <div className="p-2 rounded-lg bg-muted/50">
         <p className="text-[9px] text-muted-foreground text-center">
           💡 A IA gerará prompts consistentes mantendo o personagem igual em todas as cenas
         </p>
       </div>
     </motion.div>
   );
 }