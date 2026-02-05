 import { motion } from "framer-motion";
 import { CheckCircle2, AlertTriangle, ExternalLink, RefreshCw, Loader2 } from "lucide-react";
 import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
 import logoDark from "@/assets/logo-lacasadark.png";
 
 interface SidePanelHeaderProps {
   isOnFlowPage: boolean;
   flowPageReady: boolean;
   checkingPage: boolean;
   onOpenGoogleFlow: () => void;
   onCheckPage: () => void;
 }
 
 export function SidePanelHeader({
   isOnFlowPage,
   flowPageReady,
   checkingPage,
   onOpenGoogleFlow,
   onCheckPage,
 }: SidePanelHeaderProps) {
   return (
     <>
       {/* Header */}
       <motion.div 
         initial={{ opacity: 0, y: -10 }}
         animate={{ opacity: 1, y: 0 }}
         className="flex items-center justify-between p-4 border-b border-border gradient-header"
       >
         <div className="flex items-center gap-3">
           <motion.div
             whileHover={{ scale: 1.05, rotate: 5 }}
             transition={{ type: "spring", stiffness: 400 }}
           >
             <img src={logoDark} alt="LaCasaDark" className="h-10 w-10 rounded-xl shadow-card" />
           </motion.div>
           <div>
             <h1 className="font-bold text-sm bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
               LaCasaDark Flow
             </h1>
            <p className="text-[11px] text-muted-foreground/80">Gerador de Vídeos com IA</p>
           </div>
         </div>
         
        <div className="flex items-center gap-2">
          <ThemeToggle size="sm" />
          {checkingPage && (
            <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
          )}
        </div>
       </motion.div>
 
       {/* Connection Status */}
       {!checkingPage && (
         <motion.div 
           initial={{ opacity: 0, height: 0 }}
           animate={{ opacity: 1, height: "auto" }}
           className={`px-4 py-2.5 border-b flex items-center gap-2.5 ${
             isOnFlowPage 
               ? "bg-accent/10 border-accent/30" 
               : "bg-destructive/10 border-destructive/30"
           }`}
         >
           {isOnFlowPage ? (
             <>
               <CheckCircle2 className="w-4 h-4 text-accent" />
               <span className="text-xs text-accent font-medium">Conectado ao Google Flow</span>
               {!flowPageReady && (
                 <span className="text-[10px] text-muted-foreground ml-auto flex items-center gap-1">
                   <Loader2 className="w-3 h-3 animate-spin" />
                   Carregando...
                 </span>
               )}
             </>
           ) : (
             <>
               <AlertTriangle className="w-4 h-4 text-destructive" />
               <span className="text-xs text-destructive font-medium">Desconectado</span>
               <div className="ml-auto flex items-center gap-1.5">
                 <Button
                   variant="ghost"
                   size="sm"
                   className="h-6 px-2 text-[10px] gap-1"
                   onClick={onCheckPage}
                 >
                   <RefreshCw className="w-3 h-3" />
                   Verificar
                 </Button>
                 <Button
                   size="sm"
                   className="h-6 px-2 text-[10px] gap-1"
                   onClick={onOpenGoogleFlow}
                 >
                   <ExternalLink className="w-3 h-3" />
                   Abrir Flow
                 </Button>
               </div>
             </>
           )}
         </motion.div>
       )}
     </>
   );
 }