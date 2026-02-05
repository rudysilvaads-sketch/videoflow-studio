 import { useMemo } from "react";
 import { motion } from "framer-motion";
 import { Clock, Film } from "lucide-react";
 import { Episode, NarrativeBeat } from "@/types/episode";
 import { Badge } from "@/components/ui/badge";
 import {
   Tooltip,
   TooltipContent,
   TooltipProvider,
   TooltipTrigger,
 } from "@/components/ui/tooltip";
 
 interface EpisodeTimelineProps {
   episode: Episode;
   onBeatClick?: (beatId: string) => void;
   selectedBeatId?: string;
 }
 
 // Cores para os diferentes beats (baseadas em tons emocionais)
 const BEAT_COLORS: Record<string, string> = {
   "contemplativo": "bg-blue-500/70",
   "tensão": "bg-amber-500/70",
   "suspense": "bg-purple-500/70",
   "intenso": "bg-red-500/70",
   "reflexivo": "bg-cyan-500/70",
   "determinado": "bg-emerald-500/70",
   "dramático": "bg-rose-500/70",
   "esperança/mistério": "bg-indigo-500/70",
 };
 
 function formatTime(seconds: number): string {
   const mins = Math.floor(seconds / 60);
   const secs = seconds % 60;
   return `${mins}:${secs.toString().padStart(2, '0')}`;
 }
 
 export function EpisodeTimeline({ episode, onBeatClick, selectedBeatId }: EpisodeTimelineProps) {
   const timelineData = useMemo(() => {
     const totalScenes = episode.beats.reduce((acc, b) => acc + b.scenes.length, 0);
     const totalDuration = totalScenes * episode.sceneDuration;
     
     let currentTime = 0;
     const beats = episode.beats.map((beat) => {
       const beatScenes = beat.scenes.length;
       const beatDuration = beatScenes * episode.sceneDuration;
       const startTime = currentTime;
       const widthPercent = totalDuration > 0 ? (beatDuration / totalDuration) * 100 : 0;
       
       currentTime += beatDuration;
       
       return {
         ...beat,
         startTime,
         endTime: currentTime,
         duration: beatDuration,
         widthPercent,
         sceneCount: beatScenes,
       };
     });
     
     return {
       beats,
       totalScenes,
       totalDuration,
     };
   }, [episode]);
 
   if (timelineData.totalScenes === 0) {
     return (
       <div className="p-3 rounded-lg border border-dashed border-border bg-muted/30 text-center">
         <Film className="w-5 h-5 mx-auto mb-1 text-muted-foreground/50" />
         <p className="text-[10px] text-muted-foreground">
           Gere as cenas para ver a timeline do episódio
         </p>
       </div>
     );
   }
 
   return (
     <TooltipProvider>
       <div className="space-y-2">
         {/* Header com estatísticas */}
         <div className="flex items-center justify-between text-[10px]">
           <span className="text-muted-foreground flex items-center gap-1">
             <Clock className="w-3 h-3" />
             Timeline do Episódio
           </span>
           <Badge variant="outline" className="text-[9px] h-4">
             {formatTime(timelineData.totalDuration)} total
           </Badge>
         </div>
 
         {/* Timeline visual */}
         <div className="relative">
           {/* Barra de progresso principal */}
           <div className="h-8 rounded-lg overflow-hidden bg-muted/50 border border-border flex">
             {timelineData.beats.map((beat, index) => (
               <Tooltip key={beat.id}>
                 <TooltipTrigger asChild>
                   <motion.button
                     initial={{ scaleX: 0 }}
                     animate={{ scaleX: 1 }}
                     transition={{ delay: index * 0.05, duration: 0.3 }}
                     style={{ width: `${beat.widthPercent}%` }}
                     className={`h-full relative group transition-all origin-left ${
                       BEAT_COLORS[beat.emotionalTone.toLowerCase()] || 'bg-primary/70'
                     } ${selectedBeatId === beat.id ? 'ring-2 ring-primary ring-offset-1' : ''} 
                     hover:brightness-110 cursor-pointer`}
                     onClick={() => onBeatClick?.(beat.id)}
                   >
                     {/* Nome do beat se couber */}
                     {beat.widthPercent > 15 && (
                       <span className="absolute inset-0 flex items-center justify-center text-[9px] font-medium text-white drop-shadow-sm truncate px-1">
                         {beat.name}
                       </span>
                     )}
                     
                     {/* Número do beat */}
                     {beat.widthPercent <= 15 && beat.widthPercent > 5 && (
                       <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white drop-shadow-sm">
                         {index + 1}
                       </span>
                     )}
                     
                     {/* Separador entre beats */}
                     {index < timelineData.beats.length - 1 && (
                       <div className="absolute right-0 top-0 bottom-0 w-px bg-background/50" />
                     )}
                   </motion.button>
                 </TooltipTrigger>
                 <TooltipContent side="top" className="text-xs">
                   <div className="space-y-1">
                     <p className="font-medium">{beat.name}</p>
                     <p className="text-muted-foreground">
                       {beat.sceneCount} cenas • {formatTime(beat.duration)}
                     </p>
                     <p className="text-muted-foreground text-[10px]">
                       {formatTime(beat.startTime)} - {formatTime(beat.endTime)}
                     </p>
                   </div>
                 </TooltipContent>
               </Tooltip>
             ))}
           </div>
 
           {/* Marcadores de tempo */}
           <div className="flex justify-between mt-1 px-0.5">
             <span className="text-[8px] text-muted-foreground">0:00</span>
             <span className="text-[8px] text-muted-foreground">
               {formatTime(Math.floor(timelineData.totalDuration / 2))}
             </span>
             <span className="text-[8px] text-muted-foreground">
               {formatTime(timelineData.totalDuration)}
             </span>
           </div>
         </div>
 
         {/* Legenda dos beats */}
         <div className="flex flex-wrap gap-1.5 pt-1">
           {timelineData.beats.map((beat, index) => (
             <button
               key={beat.id}
               onClick={() => onBeatClick?.(beat.id)}
               className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] transition-all
                 ${selectedBeatId === beat.id 
                   ? 'bg-primary/20 border border-primary/50' 
                   : 'bg-muted/50 border border-transparent hover:bg-muted'
                 }`}
             >
               <div className={`w-2 h-2 rounded-sm ${BEAT_COLORS[beat.emotionalTone.toLowerCase()] || 'bg-primary/70'}`} />
               <span className="font-medium">{index + 1}.</span>
               <span className="text-muted-foreground">{beat.sceneCount}c</span>
             </button>
           ))}
         </div>
 
         {/* Detalhes do beat selecionado */}
         {selectedBeatId && (() => {
           const selectedBeat = timelineData.beats.find(b => b.id === selectedBeatId);
           if (!selectedBeat) return null;
           
           return (
             <motion.div
               initial={{ opacity: 0, y: -5 }}
               animate={{ opacity: 1, y: 0 }}
               className="p-2 rounded-lg bg-muted/50 border border-border"
             >
               <div className="flex items-center justify-between mb-1">
                 <span className="text-xs font-medium">{selectedBeat.name}</span>
                 <Badge variant="outline" className="text-[9px] h-4">
                   {formatTime(selectedBeat.startTime)} - {formatTime(selectedBeat.endTime)}
                 </Badge>
               </div>
               <p className="text-[10px] text-muted-foreground mb-1">
                 {selectedBeat.description}
               </p>
               <div className="flex items-center gap-2 text-[9px]">
                 <span className="text-muted-foreground">Tom: {selectedBeat.emotionalTone}</span>
                 <span className="text-muted-foreground">•</span>
                 <span className="text-muted-foreground">{selectedBeat.sceneCount} cenas ({formatTime(selectedBeat.duration)})</span>
               </div>
             </motion.div>
           );
         })()}
       </div>
     </TooltipProvider>
   );
 }