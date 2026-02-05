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
           <DialogContent className="max-w-md">
             <DialogHeader>
               <DialogTitle>Criar Nova Série</DialogTitle>
             </DialogHeader>
             
          <ScrollArea className="max-h-[70vh]">
            <div className="space-y-4 pt-2 pr-4">
              {/* Templates Grid */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-medium">
                    Templates Disponíveis ({seriesTemplates.length})
                  </Label>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {seriesTemplates.map(template => (
                    <motion.div
                      key={template.id}
                      whileHover={{ scale: 1.02 }}
                      className={cn(
                        "relative p-4 rounded-xl border-2 transition-all cursor-pointer group",
                        "bg-gradient-to-br from-card to-muted/30",
                        previewTemplate === template.id 
                          ? "border-primary shadow-lg shadow-primary/20" 
                          : "border-border hover:border-primary/50"
                      )}
                      onClick={() => setPreviewTemplate(
                        previewTemplate === template.id ? null : template.id
                      )}
                    >
                      {/* Header */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center text-xl",
                          `bg-gradient-to-br ${template.color}`
                        )}>
                          {template.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold truncate">
                            {template.title}
                          </h4>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {template.description}
                          </p>
                        </div>
                      </div>
                      
                      {/* Episode Count Badge */}
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-[10px]">
                          {template.suggestedEpisodes.length} episódios
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewTemplate(template.id);
                          }}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Preview
                        </Button>
                      </div>
                      
                      {/* Mini Episode Preview */}
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <div className="flex flex-wrap gap-1">
                          {template.suggestedEpisodes.slice(0, 4).map((ep, i) => (
                            <span 
                              key={i}
                              className="text-[9px] px-1.5 py-0.5 bg-muted rounded text-muted-foreground truncate max-w-[80px]"
                              title={ep.title}
                            >
                              {ep.title}
                            </span>
                          ))}
                          {template.suggestedEpisodes.length > 4 && (
                            <span className="text-[9px] px-1.5 py-0.5 bg-primary/20 text-primary rounded">
                              +{template.suggestedEpisodes.length - 4}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Expand indicator */}
                      <ChevronDown className={cn(
                        "absolute bottom-2 right-2 w-4 h-4 text-muted-foreground transition-transform",
                        previewTemplate === template.id && "rotate-180 text-primary"
                      )} />
                    </motion.div>
                  ))}
                </div>
              </div>
              
              {/* Template Preview Panel */}
              <AnimatePresence>
                {selectedPreviewTemplate && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center text-lg",
                            `bg-gradient-to-br ${selectedPreviewTemplate.color}`
                          )}>
                            {selectedPreviewTemplate.icon}
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold">{selectedPreviewTemplate.title}</h4>
                            <p className="text-xs text-muted-foreground">{selectedPreviewTemplate.description}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={() => setPreviewTemplate(null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      {/* Full Episode List */}
                      <div className="space-y-2 mb-4">
                        <Label className="text-xs text-muted-foreground">
                          Episódios incluídos:
                        </Label>
                        <div className="grid gap-2">
                          {selectedPreviewTemplate.suggestedEpisodes.map((ep, index) => (
                            <motion.div
                              key={index}
                              initial={{ x: -10, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: index * 0.05 }}
                              className="flex items-center gap-3 p-2 rounded-lg bg-background/50 border border-border/50"
                            >
                              <span className="text-xs font-mono text-muted-foreground w-6">
                                {String(index + 1).padStart(2, '0')}
                              </span>
                              <div className="flex-1 min-w-0">
                                <span className="text-sm font-medium block truncate">
                                  {ep.title}
                                </span>
                                <span className="text-xs text-muted-foreground block truncate">
                                  {ep.description}
                                </span>
                              </div>
                              <Badge variant="outline" className="text-[9px] shrink-0">
                                {ep.scenario}
                              </Badge>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                      
                      <Button 
                        onClick={() => {
                          createFromTemplate(selectedPreviewTemplate.id);
                          setIsCreateOpen(false);
                          setPreviewTemplate(null);
                        }}
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Criar "{selectedPreviewTemplate.title}"
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-background px-3 text-muted-foreground">ou crie do zero</span>
                </div>
              </div>

              {/* Custom Series */}
              <div className="space-y-3 pb-2">
                <div>
                  <Label className="text-sm">Título da Série</Label>
                  <Input 
                    value={newSeriesTitle}
                    onChange={(e) => setNewSeriesTitle(e.target.value)}
                    placeholder="Ex: A Jornada para o Norte"
                    className="mt-1.5 h-10"
                  />
                </div>
                <div>
                  <Label className="text-sm">Descrição</Label>
                  <Input 
                    value={newSeriesDesc}
                    onChange={(e) => setNewSeriesDesc(e.target.value)}
                    placeholder="Breve descrição do arco narrativo"
                    className="mt-1.5 h-10"
                  />
                </div>
                <Button 
                  onClick={createCustomSeries}
                  disabled={!newSeriesTitle.trim()}
                  className="w-full h-10"
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Série Personalizada
                </Button>
              </div>
            </div>
          </ScrollArea>
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