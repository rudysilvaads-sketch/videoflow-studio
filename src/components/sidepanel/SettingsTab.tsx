 import { motion } from "framer-motion";
 import { 
   Gauge, 
   Video, 
   Timer, 
   Download,
   Settings2,
  Ratio,
  Palette
 } from "lucide-react";
 import { Label } from "@/components/ui/label";
 import { Input } from "@/components/ui/input";
 import { Switch } from "@/components/ui/switch";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useTheme } from "@/hooks/useTheme";
 import { 
   Select, 
   SelectContent, 
   SelectItem, 
   SelectTrigger, 
   SelectValue 
 } from "@/components/ui/select";
 
 interface AppSettings {
   videosPerTask: number;
   model: string;
   ratio: string;
   startFrom: number;
   waitTimeMin: number;
   waitTimeMax: number;
   language: string;
   autoDownload: boolean;
 }
 
 interface SettingsTabProps {
   settings: AppSettings;
   onSettingsChange: (settings: AppSettings) => void;
 }
 
 export function SettingsTab({ settings, onSettingsChange }: SettingsTabProps) {
   const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
     onSettingsChange({ ...settings, [key]: value });
   };
  
  const { isDark } = useTheme();
 
   return (
     <motion.div 
       initial={{ opacity: 0 }}
       animate={{ opacity: 1 }}
       className="p-4 space-y-5"
     >
      {/* Theme Toggle */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-primary/10">
            <Palette className="w-3.5 h-3.5 text-primary" />
          </div>
          <div>
            <Label className="text-xs font-medium">Tema da Interface</Label>
            <p className="text-[10px] text-muted-foreground">
              {isDark ? "Modo escuro ativado" : "Modo claro ativado"}
            </p>
          </div>
        </div>
        <ThemeToggle size="sm" />
      </div>

       {/* Model Selection */}
       <div className="space-y-2">
         <Label className="text-xs font-semibold flex items-center gap-2">
           <div className="p-1.5 rounded-md bg-primary/10">
             <Video className="w-3.5 h-3.5 text-primary" />
           </div>
           Modelo de Geração
         </Label>
         <Select value={settings.model} onValueChange={(v) => updateSetting('model', v)}>
           <SelectTrigger className="h-9 rounded-lg">
             <SelectValue />
           </SelectTrigger>
           <SelectContent>
             <SelectItem value="veo-3.1-fast">Veo 3.1 Fast (Rápido)</SelectItem>
             <SelectItem value="veo-3.1">Veo 3.1 (Qualidade)</SelectItem>
             <SelectItem value="veo-3">Veo 3 (Clássico)</SelectItem>
           </SelectContent>
         </Select>
       </div>
 
       {/* Aspect Ratio */}
       <div className="space-y-2">
         <Label className="text-xs font-semibold flex items-center gap-2">
           <div className="p-1.5 rounded-md bg-accent/10">
             <Ratio className="w-3.5 h-3.5 text-accent" />
           </div>
           Proporção do Vídeo
         </Label>
         <Select value={settings.ratio} onValueChange={(v) => updateSetting('ratio', v)}>
           <SelectTrigger className="h-9 rounded-lg">
             <SelectValue />
           </SelectTrigger>
           <SelectContent>
             <SelectItem value="16:9">16:9 (Widescreen)</SelectItem>
             <SelectItem value="9:16">9:16 (Vertical/Shorts)</SelectItem>
             <SelectItem value="1:1">1:1 (Quadrado)</SelectItem>
             <SelectItem value="4:3">4:3 (Clássico)</SelectItem>
           </SelectContent>
         </Select>
       </div>
 
       {/* Videos per Task */}
       <div className="space-y-2">
         <Label className="text-xs font-semibold flex items-center gap-2">
           <div className="p-1.5 rounded-md bg-muted">
             <Gauge className="w-3.5 h-3.5 text-muted-foreground" />
           </div>
           Vídeos por Tarefa
         </Label>
         <Select 
           value={String(settings.videosPerTask)} 
           onValueChange={(v) => updateSetting('videosPerTask', Number(v))}
         >
           <SelectTrigger className="h-9 rounded-lg">
             <SelectValue />
           </SelectTrigger>
           <SelectContent>
             <SelectItem value="1">1 vídeo</SelectItem>
             <SelectItem value="2">2 vídeos</SelectItem>
             <SelectItem value="4">4 vídeos</SelectItem>
           </SelectContent>
         </Select>
       </div>
 
       {/* Wait Time */}
       <div className="space-y-2">
         <Label className="text-xs font-semibold flex items-center gap-2">
           <div className="p-1.5 rounded-md bg-muted">
             <Timer className="w-3.5 h-3.5 text-muted-foreground" />
           </div>
           Tempo de Espera (segundos)
         </Label>
         <div className="grid grid-cols-2 gap-3">
           <div>
             <Label className="text-[10px] text-muted-foreground mb-1 block">Mínimo</Label>
             <Input
               type="number"
               value={settings.waitTimeMin}
               onChange={(e) => updateSetting('waitTimeMin', Number(e.target.value))}
               className="h-9 rounded-lg"
               min={5}
               max={300}
             />
           </div>
           <div>
             <Label className="text-[10px] text-muted-foreground mb-1 block">Máximo</Label>
             <Input
               type="number"
               value={settings.waitTimeMax}
               onChange={(e) => updateSetting('waitTimeMax', Number(e.target.value))}
               className="h-9 rounded-lg"
               min={10}
               max={600}
             />
           </div>
         </div>
       </div>
 
       {/* Auto Download */}
       <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border">
         <div className="flex items-center gap-2.5">
           <div className="p-1.5 rounded-md bg-accent/10">
             <Download className="w-3.5 h-3.5 text-accent" />
           </div>
           <div>
             <Label className="text-xs font-medium">Download Automático</Label>
             <p className="text-[10px] text-muted-foreground">Baixar vídeos ao concluir</p>
           </div>
         </div>
         <Switch
           checked={settings.autoDownload}
           onCheckedChange={(v) => updateSetting('autoDownload', v)}
         />
       </div>
 
       {/* Info */}
       <div className="p-3 rounded-xl bg-muted/50 border border-border">
         <div className="flex items-start gap-2">
           <Settings2 className="w-4 h-4 text-muted-foreground mt-0.5" />
           <div>
             <p className="text-xs font-medium">Configurações Salvas Localmente</p>
             <p className="text-[10px] text-muted-foreground mt-0.5">
               Suas preferências são salvas no navegador e persistem entre sessões.
             </p>
           </div>
         </div>
       </div>
     </motion.div>
   );
 }