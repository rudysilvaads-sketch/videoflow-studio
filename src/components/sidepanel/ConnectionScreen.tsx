 import { motion } from "framer-motion";
 import { ExternalLink, RefreshCw, Zap, Video, Sparkles } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import logoDark from "@/assets/logo-lacasadark.png";
 
 interface ConnectionScreenProps {
   onOpenGoogleFlow: () => void;
   onCheckConnection: () => void;
 }
 
 export function ConnectionScreen({ onOpenGoogleFlow, onCheckConnection }: ConnectionScreenProps) {
   return (
     <div className="h-screen w-full bg-background flex flex-col overflow-hidden">
       {/* Header */}
       <motion.div 
         initial={{ opacity: 0, y: -20 }}
         animate={{ opacity: 1, y: 0 }}
         className="flex items-center gap-3 p-4 border-b border-border gradient-header"
       >
         <motion.img 
           src={logoDark} 
           alt="LaCasaDark" 
           className="h-10 w-10 rounded-xl shadow-card"
           whileHover={{ scale: 1.05, rotate: 5 }}
         />
         <div>
           <h1 className="font-bold text-sm text-gradient">LaCasaDark Flow</h1>
           <p className="text-[11px] text-muted-foreground">Gerador de Vídeos com IA</p>
         </div>
       </motion.div>
 
       {/* Content */}
       <div className="flex-1 p-5 flex flex-col justify-center">
         <motion.div 
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ delay: 0.1 }}
           className="text-center mb-8"
         >
           <motion.div 
             className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center"
             animate={{ 
               boxShadow: [
                 "0 0 20px hsl(265 85% 60% / 0.2)",
                 "0 0 40px hsl(265 85% 60% / 0.3)",
                 "0 0 20px hsl(265 85% 60% / 0.2)"
               ]
             }}
             transition={{ duration: 2, repeat: Infinity }}
           >
             <Video className="w-10 h-10 text-primary" />
           </motion.div>
           <h2 className="text-lg font-bold mb-2">Conecte ao Google Flow</h2>
           <p className="text-sm text-muted-foreground max-w-xs mx-auto">
             Abra o Google Flow para começar a gerar vídeos com IA de forma automatizada.
           </p>
         </motion.div>
 
         {/* Features */}
         <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           className="space-y-3 mb-8"
         >
           {[
             { icon: Sparkles, text: "Consistência de personagens" },
             { icon: Zap, text: "Processamento em lote" },
             { icon: Video, text: "Download automático" },
           ].map((feature, i) => (
             <motion.div
               key={feature.text}
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.3 + i * 0.1 }}
               className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border"
             >
               <div className="p-2 rounded-lg bg-primary/10">
                 <feature.icon className="w-4 h-4 text-primary" />
               </div>
               <span className="text-sm">{feature.text}</span>
             </motion.div>
           ))}
         </motion.div>
 
         {/* Actions */}
         <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.5 }}
           className="space-y-3"
         >
           <Button 
             onClick={onOpenGoogleFlow} 
             className="w-full h-12 gap-2 text-sm font-semibold shadow-button"
           >
             <ExternalLink className="w-4 h-4" />
             Abrir Google Flow
           </Button>
 
           <Button
             variant="ghost"
             className="w-full h-10 text-xs gap-2 text-muted-foreground"
             onClick={onCheckConnection}
           >
             <RefreshCw className="w-3.5 h-3.5" />
             Verificar Conexão
           </Button>
         </motion.div>
       </div>
 
       {/* Footer */}
       <motion.div 
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         transition={{ delay: 0.6 }}
         className="p-4 border-t border-border text-center"
       >
         <p className="text-[10px] text-muted-foreground/60">
           Funciona apenas em <span className="font-mono">labs.google/fx/tools/flow</span>
         </p>
       </motion.div>
     </div>
   );
 }