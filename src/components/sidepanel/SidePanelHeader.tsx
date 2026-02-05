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
        className="flex items-center justify-between p-5 border-b border-border gradient-header"
       >
        <div className="flex items-center gap-4">
           <motion.div
             whileHover={{ scale: 1.05, rotate: 5 }}
             transition={{ type: "spring", stiffness: 400 }}
           >
            <img src={logoDark} alt="LaCasaDark" className="h-12 w-12 rounded-xl shadow-card" />
           </motion.div>
           <div>
            <h1 className="font-bold text-base bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
               LaCasaDark Flow
             </h1>
            <p className="text-sm text-muted-foreground/80">Gerador de Vídeos com IA</p>
           </div>
         </div>
         
        <div className="flex items-center gap-2">
          <ThemeToggle size="sm" />
          {checkingPage && (
            <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
          )}
        </div>
       </motion.div>
 
       {/* Connection Status */}
       {!checkingPage && (
         <motion.div 
           initial={{ opacity: 0, height: 0 }}
           animate={{ opacity: 1, height: "auto" }}
          className={`px-5 py-3 border-b flex items-center gap-3 ${
             isOnFlowPage 
               ? "bg-accent/10 border-accent/30" 
               : "bg-destructive/10 border-destructive/30"
           }`}
         >
           {isOnFlowPage ? (
             <>
              <CheckCircle2 className="w-5 h-5 text-accent" />
              <span className="text-sm text-accent font-medium">Conectado ao Google Flow</span>
               {!flowPageReady && (
                <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1.5">
                  <Loader2 className="w-4 h-4 animate-spin" />
                   Carregando...
                 </span>
               )}
             </>
           ) : (
             <>
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <span className="text-sm text-destructive font-medium">Desconectado</span>
               <div className="ml-auto flex items-center gap-1.5">
                 <Button
                   variant="ghost"
                   size="sm"
                  className="h-8 px-3 text-xs gap-1.5"
                   onClick={onCheckPage}
                 >
                  <RefreshCw className="w-4 h-4" />
                   Verificar
                 </Button>
                 <Button
                   size="sm"
                  className="h-8 px-3 text-xs gap-1.5"
                   onClick={onOpenGoogleFlow}
                 >
                  <ExternalLink className="w-4 h-4" />
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