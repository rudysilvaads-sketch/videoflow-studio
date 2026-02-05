 import { useState } from "react";
 import { motion, AnimatePresence } from "framer-motion";
 import { 
   Plus, 
   ChevronRight, 
   Play, 
   CheckCircle2, 
   Layers,
   Film,
   Trash2,
   Edit3,
  MoreVertical,
  X,
  Eye,
  ChevronDown
 } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { 
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
 } from "@/components/ui/dialog";
 import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
 } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
 import { Series, Episode } from "@/types/series";
 import { seriesTemplates } from "@/data/survivalScenarios";
 import { cn } from "@/lib/utils";
 
 interface SeriesManagerProps {
   series: Series[];
   onSeriesChange: (series: Series[]) => void;
   onSelectEpisode: (episode: Episode, seriesTitle: string) => void;
   activeSeries?: string;
   activeEpisode?: string;
 }
 
 export function SeriesManager({ 
   series, 
   onSeriesChange, 
   onSelectEpisode,
   activeSeries,
   activeEpisode 
 }: SeriesManagerProps) {
   const [expandedSeries, setExpandedSeries] = useState<string | null>(activeSeries || null);
   const [isCreateOpen, setIsCreateOpen] = useState(false);
   const [newSeriesTitle, setNewSeriesTitle] = useState("");
   const [newSeriesDesc, setNewSeriesDesc] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);
 
   const toggleExpand = (seriesId: string) => {
     setExpandedSeries(prev => prev === seriesId ? null : seriesId);
   };
 
   const createFromTemplate = (templateId: string) => {
     const template = seriesTemplates.find(t => t.id === templateId);
     if (!template) return;
 
     const newSeries: Series = {
       id: `series-${Date.now()}`,
       title: template.title,
       description: template.description,
       icon: template.icon,
       color: template.color,
       episodes: template.suggestedEpisodes.map((ep, i) => ({
         id: `ep-${Date.now()}-${i}`,
         title: ep.title,
         description: ep.description,
         scenario: ep.scenario,
         soundscape: "",
         completed: false,
         videoCount: 0,
       })),
       createdAt: new Date().toISOString(),
       updatedAt: new Date().toISOString(),
     };
 
     onSeriesChange([...series, newSeries]);
     setExpandedSeries(newSeries.id);
   };
 
   const createCustomSeries = () => {
     if (!newSeriesTitle.trim()) return;
 
     const newSeries: Series = {
       id: `series-${Date.now()}`,
       title: newSeriesTitle,
       description: newSeriesDesc,
       icon: "📺",
       color: "from-primary to-purple-600",
       episodes: [],
       createdAt: new Date().toISOString(),
       updatedAt: new Date().toISOString(),
     };
 
     onSeriesChange([...series, newSeries]);
     setExpandedSeries(newSeries.id);
     setNewSeriesTitle("");
     setNewSeriesDesc("");
     setIsCreateOpen(false);
   };
 
  const selectedPreviewTemplate = seriesTemplates.find(t => t.id === previewTemplate);

   const deleteSeries = (seriesId: string) => {
     onSeriesChange(series.filter(s => s.id !== seriesId));
   };
 
   const toggleEpisodeComplete = (seriesId: string, episodeId: string) => {
     onSeriesChange(series.map(s => {
       if (s.id !== seriesId) return s;
       return {
         ...s,
         episodes: s.episodes.map(ep => 
           ep.id === episodeId ? { ...ep, completed: !ep.completed } : ep
         ),
         updatedAt: new Date().toISOString(),
       };
     }));
   };
 
   return (
     <div className="space-y-4">
       {/* Header */}
       <div className="flex items-center justify-between">
         <div className="flex items-center gap-2">
           <div className="p-1.5 rounded-lg bg-primary/10">
             <Layers className="w-4 h-4 text-primary" />
           </div>
           <div>
             <h3 className="text-sm font-semibold">Séries & Capítulos</h3>
             <p className="text-[10px] text-muted-foreground">Organize sua narrativa</p>
           </div>
         </div>
 
         <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
           <DialogTrigger asChild>
             <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
               <Plus className="w-3 h-3" />
               Nova Série
             </Button>
           </DialogTrigger>
            <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
             <DialogHeader>
                <DialogTitle className="px-6 pt-6 pb-4">Criar Nova Série</DialogTitle>
             </DialogHeader>
             
          <div className="flex h-[65vh]">
            {/* Left: Template Grid */}
            <div className="flex-1 flex flex-col border-r border-border">
              <div className="px-4 py-2 border-b border-border bg-muted/30">
                <Label className="text-xs font-medium text-muted-foreground">
                  Templates Disponíveis ({seriesTemplates.length})
                </Label>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-3 grid grid-cols-2 gap-2">
                  {seriesTemplates.map(template => (
                    <motion.button
                      key={template.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "relative p-3 rounded-lg border text-left transition-all",
                        "hover:bg-muted/50",
                        previewTemplate === template.id 
                          ? "border-primary bg-primary/5 ring-1 ring-primary/30" 
                          : "border-border"
                      )}
                      onClick={() => setPreviewTemplate(template.id)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={cn(
                          "w-8 h-8 rounded-md flex items-center justify-center text-base shrink-0",
                          `bg-gradient-to-br ${template.color}`
                        )}>
                          {template.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-medium truncate">
                            {template.title}
                          </h4>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {template.suggestedEpisodes.length} episódios
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
                
                {/* Custom Series Section */}
                <div className="p-3 border-t border-border">
                  <div className="relative py-2 mb-3">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-[10px]">
                      <span className="bg-background px-2 text-muted-foreground">ou crie do zero</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Input 
                      value={newSeriesTitle}
                      onChange={(e) => setNewSeriesTitle(e.target.value)}
                      placeholder="Título da série..."
                      className="h-8 text-xs"
                    />
                    <Input 
                      value={newSeriesDesc}
                      onChange={(e) => setNewSeriesDesc(e.target.value)}
                      placeholder="Descrição..."
                      className="h-8 text-xs"
                    />
                    <Button 
                      onClick={createCustomSeries}
                      disabled={!newSeriesTitle.trim()}
                      className="w-full h-8 text-xs"
                      variant="outline"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Criar Personalizada
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </div>
            
            {/* Right: Preview Panel */}
            <div className="w-[280px] flex flex-col bg-muted/20">
              <AnimatePresence mode="wait">
                {selectedPreviewTemplate ? (
                  <motion.div
                    key={selectedPreviewTemplate.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col h-full"
                  >
                    {/* Preview Header */}
                    <div className="p-4 border-b border-border">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0",
                          `bg-gradient-to-br ${selectedPreviewTemplate.color}`
                        )}>
                          {selectedPreviewTemplate.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold">{selectedPreviewTemplate.title}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {selectedPreviewTemplate.description}
                          </p>
                          <Badge variant="secondary" className="mt-2 text-[10px]">
                            {selectedPreviewTemplate.suggestedEpisodes.length} episódios
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    {/* Episode List */}
                    <ScrollArea className="flex-1">
                      <div className="p-3 space-y-1.5">
                        {selectedPreviewTemplate.suggestedEpisodes.map((ep, index) => (
                          <motion.div
                            key={index}
                            initial={{ x: 10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: index * 0.03 }}
                            className="flex items-start gap-2 p-2 rounded-lg bg-background/60 border border-border/50"
                          >
                            <span className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded shrink-0">
                              {String(index + 1).padStart(2, '0')}
                            </span>
                            <div className="flex-1 min-w-0">
                              <span className="text-xs font-medium block truncate">
                                {ep.title}
                              </span>
                              <span className="text-[10px] text-muted-foreground block truncate">
                                {ep.description}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </ScrollArea>
                    
                    {/* Create Button */}
                    <div className="p-4 border-t border-border bg-background">
                      <Button 
                        onClick={() => {
                          createFromTemplate(selectedPreviewTemplate.id);
                          setIsCreateOpen(false);
                          setPreviewTemplate(null);
                        }}
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Criar Série
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 flex flex-col items-center justify-center p-6 text-center"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                      <Eye className="w-8 h-8 text-muted-foreground/40" />
                    </div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Selecione um template
                    </h4>
                    <p className="text-xs text-muted-foreground/60">
                      Clique em um template para ver os episódios
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
           </DialogContent>
         </Dialog>
       </div>
 
       {/* Series List */}
       <div className="space-y-2">
         {series.length === 0 ? (
           <div className="text-center py-8 text-muted-foreground">
             <Film className="w-8 h-8 mx-auto mb-2 opacity-50" />
             <p className="text-xs">Nenhuma série criada</p>
             <p className="text-[10px]">Crie sua primeira série para organizar os episódios</p>
           </div>
         ) : (
           series.map(s => {
             const completedCount = s.episodes.filter(e => e.completed).length;
             const isExpanded = expandedSeries === s.id;
 
             return (
               <motion.div
                 key={s.id}
                 layout
                 className="rounded-xl border border-border overflow-hidden bg-card"
               >
                 {/* Series Header */}
                 <button
                   onClick={() => toggleExpand(s.id)}
                   className={cn(
                     "w-full p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors",
                     isExpanded && "bg-muted/30"
                   )}
                 >
                   <div className={cn(
                     "w-8 h-8 rounded-lg flex items-center justify-center text-lg",
                     `bg-gradient-to-br ${s.color}`
                   )}>
                     {s.icon}
                   </div>
 
                   <div className="flex-1 text-left">
                     <div className="flex items-center gap-2">
                       <span className="text-sm font-medium">{s.title}</span>
                       <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                         {completedCount}/{s.episodes.length}
                       </span>
                     </div>
                     <p className="text-[10px] text-muted-foreground line-clamp-1">
                       {s.description}
                     </p>
                   </div>
 
                   <ChevronRight className={cn(
                     "w-4 h-4 text-muted-foreground transition-transform",
                     isExpanded && "rotate-90"
                   )} />
 
                   <DropdownMenu>
                     <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                       <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                         <MoreVertical className="w-3 h-3" />
                       </Button>
                     </DropdownMenuTrigger>
                     <DropdownMenuContent align="end">
                       <DropdownMenuItem>
                         <Edit3 className="w-3 h-3 mr-2" />
                         Editar
                       </DropdownMenuItem>
                       <DropdownMenuItem 
                         className="text-destructive"
                         onClick={() => deleteSeries(s.id)}
                       >
                         <Trash2 className="w-3 h-3 mr-2" />
                         Excluir
                       </DropdownMenuItem>
                     </DropdownMenuContent>
                   </DropdownMenu>
                 </button>
 
                 {/* Episodes */}
                 <AnimatePresence>
                   {isExpanded && (
                     <motion.div
                       initial={{ height: 0, opacity: 0 }}
                       animate={{ height: "auto", opacity: 1 }}
                       exit={{ height: 0, opacity: 0 }}
                       transition={{ duration: 0.2 }}
                       className="overflow-hidden"
                     >
                       <div className="p-2 pt-0 space-y-1">
                         {s.episodes.map((ep, index) => (
                           <motion.div
                             key={ep.id}
                             initial={{ x: -10, opacity: 0 }}
                             animate={{ x: 0, opacity: 1 }}
                             transition={{ delay: index * 0.05 }}
                             className={cn(
                               "flex items-center gap-2 p-2 rounded-lg transition-colors cursor-pointer",
                               "hover:bg-muted/50",
                               activeEpisode === ep.id && "bg-primary/10 border border-primary/30",
                               ep.completed && "opacity-60"
                             )}
                             onClick={() => onSelectEpisode(ep, s.title)}
                           >
                             <button
                               onClick={(e) => {
                                 e.stopPropagation();
                                 toggleEpisodeComplete(s.id, ep.id);
                               }}
                               className={cn(
                                 "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                                 ep.completed 
                                   ? "bg-accent border-accent text-accent-foreground" 
                                   : "border-muted-foreground/30"
                               )}
                             >
                               {ep.completed && <CheckCircle2 className="w-3 h-3" />}
                             </button>
 
                             <div className="flex-1 min-w-0">
                               <div className="flex items-center gap-1.5">
                                 <span className="text-[10px] text-muted-foreground font-mono">
                                   {String(index + 1).padStart(2, '0')}
                                 </span>
                                 <span className={cn(
                                   "text-xs font-medium truncate",
                                   ep.completed && "line-through"
                                 )}>
                                   {ep.title}
                                 </span>
                               </div>
                               <p className="text-[10px] text-muted-foreground truncate">
                                 {ep.description}
                               </p>
                             </div>
 
                             <Button 
                               variant="ghost" 
                               size="sm" 
                               className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                             >
                               <Play className="w-3 h-3" />
                             </Button>
                           </motion.div>
                         ))}
 
                         {s.episodes.length === 0 && (
                           <p className="text-center text-[10px] text-muted-foreground py-4">
                             Nenhum episódio ainda
                           </p>
                         )}
                       </div>
                     </motion.div>
                   )}
                 </AnimatePresence>
               </motion.div>
             );
           })
         )}
       </div>
     </div>
   );
 }