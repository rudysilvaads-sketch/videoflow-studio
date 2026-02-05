 import { motion } from "framer-motion";
import { useState, useEffect } from "react";
 import { 
   Gauge, 
   Video, 
   Timer, 
   Download,
   Settings2,
  Ratio,
  Palette,
  Key,
  Cookie,
  Eye,
  EyeOff,
  Check,
  AlertCircle
 } from "lucide-react";
 import { Label } from "@/components/ui/label";
 import { Input } from "@/components/ui/input";
 import { Switch } from "@/components/ui/switch";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
 import { 
   Select, 
   SelectContent, 
   SelectItem, 
   SelectTrigger, 
   SelectValue 
 } from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
 
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
 
interface ApiCredentials {
  geminiApiKey: string;
  imageFxCookies: string;
}

const CREDENTIALS_KEY = "lacasadark_credentials";

 interface SettingsTabProps {
   settings: AppSettings;
   onSettingsChange: (settings: AppSettings) => void;
 }
 
 export function SettingsTab({ settings, onSettingsChange }: SettingsTabProps) {
   const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
     onSettingsChange({ ...settings, [key]: value });
   };
  
  const { isDark } = useTheme();
  
  // API Credentials state
  const [credentials, setCredentials] = useState<ApiCredentials>(() => {
    const stored = localStorage.getItem(CREDENTIALS_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return { geminiApiKey: "", imageFxCookies: "" };
      }
    }
    return { geminiApiKey: "", imageFxCookies: "" };
  });
  
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showCookies, setShowCookies] = useState(false);
  const [apiSectionOpen, setApiSectionOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Save credentials to localStorage
  useEffect(() => {
    localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials));
  }, [credentials]);
  
  const handleSaveCredentials = () => {
    localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  
  const hasGeminiKey = credentials.geminiApiKey.length > 0;
  const hasCookies = credentials.imageFxCookies.length > 0;
 
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

      {/* API & Credentials Section */}
      <Collapsible open={apiSectionOpen} onOpenChange={setApiSectionOpen}>
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between p-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-md bg-amber-500/10">
                <Key className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-left">
                <Label className="text-xs font-medium cursor-pointer">APIs & Credenciais</Label>
                <p className="text-[10px] text-muted-foreground">
                  Gemini API, ImageFX Cookies
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {(hasGeminiKey || hasCookies) && (
                <Badge variant="secondary" className="text-[9px] h-4 bg-accent/20 text-accent">
                  {[hasGeminiKey && "Gemini", hasCookies && "ImageFX"].filter(Boolean).join(" + ")}
                </Badge>
              )}
              <motion.div
                animate={{ rotate: apiSectionOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-muted-foreground">
                  <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.div>
            </div>
          </button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 space-y-4 p-3 rounded-xl bg-muted/30 border border-border"
          >
            {/* Gemini API Key */}
            <div className="space-y-2">
              <Label className="text-xs font-medium flex items-center gap-2">
                <Key className="w-3 h-3 text-amber-500" />
                Gemini API Key
                {hasGeminiKey && (
                  <Badge variant="outline" className="text-[9px] h-4 text-accent border-accent/30">
                    <Check className="w-2 h-2 mr-0.5" /> Configurada
                  </Badge>
                )}
              </Label>
              <div className="relative">
                <Input
                  type={showGeminiKey ? "text" : "password"}
                  value={credentials.geminiApiKey}
                  onChange={(e) => setCredentials(prev => ({ ...prev, geminiApiKey: e.target.value }))}
                  placeholder="AIzaSy..."
                  className="h-9 pr-10 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowGeminiKey(!showGeminiKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded"
                >
                  {showGeminiKey ? (
                    <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
                  ) : (
                    <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Obtenha em{" "}
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Google AI Studio
                </a>
              </p>
            </div>

            {/* ImageFX Cookies */}
            <div className="space-y-2">
              <Label className="text-xs font-medium flex items-center gap-2">
                <Cookie className="w-3 h-3 text-orange-500" />
                ImageFX Cookies
                {hasCookies && (
                  <Badge variant="outline" className="text-[9px] h-4 text-accent border-accent/30">
                    <Check className="w-2 h-2 mr-0.5" /> Configurados
                  </Badge>
                )}
              </Label>
              <div className="relative">
                <Textarea
                  value={credentials.imageFxCookies}
                  onChange={(e) => setCredentials(prev => ({ ...prev, imageFxCookies: e.target.value }))}
                  placeholder="Cole os cookies do ImageFX aqui..."
                  className={cn(
                    "min-h-[80px] font-mono text-xs resize-none",
                    !showCookies && credentials.imageFxCookies && "text-transparent select-none"
                  )}
                  style={!showCookies && credentials.imageFxCookies ? { 
                    textShadow: "0 0 8px hsl(var(--foreground))" 
                  } : undefined}
                />
                {credentials.imageFxCookies && (
                  <button
                    type="button"
                    onClick={() => setShowCookies(!showCookies)}
                    className="absolute right-2 top-2 p-1 hover:bg-muted rounded bg-background/80"
                  >
                    {showCookies ? (
                      <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
                    ) : (
                      <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                  </button>
                )}
              </div>
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <p className="text-[10px] text-amber-600 dark:text-amber-400">
                  <strong>Como obter:</strong> Abra o ImageFX, pressione F12, vá em Application → Cookies, 
                  e copie todos os cookies como string. Isso permite gerar imagens consistentes dos personagens.
                </p>
              </div>
            </div>

            {/* Save Button */}
            <Button 
              onClick={handleSaveCredentials}
              size="sm"
              className="w-full gap-2"
              variant={saved ? "outline" : "default"}
            >
              {saved ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Credenciais Salvas!
                </>
              ) : (
                <>
                  <Key className="w-3.5 h-3.5" />
                  Salvar Credenciais
                </>
              )}
            </Button>

            {/* Security Note */}
            <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/50">
              <AlertCircle className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-[10px] text-muted-foreground">
                Suas credenciais são salvas apenas localmente no seu navegador e nunca são enviadas para servidores externos.
              </p>
            </div>
          </motion.div>
        </CollapsibleContent>
      </Collapsible>

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