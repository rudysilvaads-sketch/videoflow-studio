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
   AlertCircle,
   Loader2,
   XCircle
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
 import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
 
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
   const [validatingGemini, setValidatingGemini] = useState(false);
   const [geminiValidation, setGeminiValidation] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [validatingCookies, setValidatingCookies] = useState(false);
  const [cookiesValidation, setCookiesValidation] = useState<'idle' | 'valid' | 'invalid'>('idle');
   
   // Validate Gemini API Key
   const validateGeminiKey = async (apiKey: string): Promise<boolean> => {
     if (!apiKey.trim()) return false;
     
     try {
       // Make a simple request to list models - this validates the API key
       const response = await fetch(
         `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
         { method: 'GET' }
       );
       
       return response.ok;
     } catch (error) {
       console.error('Gemini validation error:', error);
       return false;
     }
   };
   
   // Handle Gemini key change with debounced validation
   const handleGeminiKeyChange = (value: string) => {
     setCredentials(prev => ({ ...prev, geminiApiKey: value }));
     setGeminiValidation('idle');
   };
   
   // Validate on blur or explicit test
   const handleTestGeminiKey = async () => {
     if (!credentials.geminiApiKey.trim()) {
       toast.error('Digite uma API key para validar');
       return;
     }
     
     setValidatingGemini(true);
     setGeminiValidation('idle');
     
     const isValid = await validateGeminiKey(credentials.geminiApiKey);
     
     setValidatingGemini(false);
     setGeminiValidation(isValid ? 'valid' : 'invalid');
     
     if (isValid) {
       toast.success('API Key válida! Conexão estabelecida.');
     } else {
       toast.error('API Key inválida. Verifique e tente novamente.');
     }
   };
  
  // Handle cookies change
  const handleCookiesChange = (value: string) => {
    setCredentials(prev => ({ ...prev, imageFxCookies: value }));
    setCookiesValidation('idle');
  };
  
  // Validate ImageFX Cookies
  const handleTestCookies = async () => {
    if (!credentials.imageFxCookies.trim()) {
      toast.error('Cole os cookies para validar');
      return;
    }
    
    setValidatingCookies(true);
    setCookiesValidation('idle');
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-imagefx', {
        body: {
          cookies: credentials.imageFxCookies,
          validateOnly: true,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.valid) {
        setCookiesValidation('valid');
        toast.success('Cookies válidos! Sessão ativa.');
      } else {
        setCookiesValidation('invalid');
        toast.error(data.error || 'Cookies inválidos ou expirados.');
      }
    } catch (err) {
      console.error('Cookie validation error:', err);
      setCookiesValidation('invalid');
      toast.error('Erro ao validar cookies. Tente novamente.');
    } finally {
      setValidatingCookies(false);
    }
  };
  
  // Save credentials to localStorage
  useEffect(() => {
    localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials));
  }, [credentials]);
  
   const handleSaveCredentials = async () => {
     // Validate Gemini key if it exists and hasn't been validated
     if (credentials.geminiApiKey.trim() && geminiValidation !== 'valid') {
       setValidatingGemini(true);
       const isValid = await validateGeminiKey(credentials.geminiApiKey);
       setValidatingGemini(false);
       
       if (!isValid) {
         setGeminiValidation('invalid');
         toast.error('API Key do Gemini inválida. Corrija antes de salvar.');
         return;
       }
       setGeminiValidation('valid');
     }
    
    // Validate cookies if they exist and haven't been validated
    if (credentials.imageFxCookies.trim() && cookiesValidation !== 'valid') {
      setValidatingCookies(true);
      
      try {
        const { data, error } = await supabase.functions.invoke('generate-imagefx', {
          body: {
            cookies: credentials.imageFxCookies,
            validateOnly: true,
          },
        });

        setValidatingCookies(false);
        
        if (error || !data.valid) {
          setCookiesValidation('invalid');
          toast.error('Cookies do ImageFX inválidos. Corrija antes de salvar.');
          return;
        }
        setCookiesValidation('valid');
      } catch (err) {
        setValidatingCookies(false);
        setCookiesValidation('invalid');
        toast.error('Erro ao validar cookies. Tente novamente.');
        return;
      }
    }
     
    localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials));
    setSaved(true);
     toast.success('Credenciais salvas com sucesso!');
    setTimeout(() => setSaved(false), 2000);
  };
  
  const hasGeminiKey = credentials.geminiApiKey.length > 0;
  const hasCookies = credentials.imageFxCookies.length > 0;
 
   return (
     <motion.div 
       initial={{ opacity: 0 }}
       animate={{ opacity: 1 }}
      className="p-5 space-y-6"
     >
      {/* Theme Toggle */}
     <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
       <div className="flex items-center gap-3">
         <div className="p-2 rounded-md bg-primary/10">
           <Palette className="w-4 h-4 text-primary" />
          </div>
          <div>
           <Label className="text-sm font-medium">Tema da Interface</Label>
           <p className="text-xs text-muted-foreground">
              {isDark ? "Modo escuro ativado" : "Modo claro ativado"}
            </p>
          </div>
        </div>
        <ThemeToggle size="sm" />
      </div>

      {/* API & Credentials Section */}
      <Collapsible open={apiSectionOpen} onOpenChange={setApiSectionOpen}>
        <CollapsibleTrigger asChild>
         <button className="w-full flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors">
           <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-accent/10">
                <Key className="w-4 h-4 text-accent" />
              </div>
              <div className="text-left">
                <Label className="text-sm font-medium cursor-pointer">APIs & Credenciais</Label>
                <p className="text-xs text-muted-foreground">
                  Gemini API, ImageFX Cookies
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {(hasGeminiKey || hasCookies) && (
                <Badge variant="secondary" className="text-xs h-5 bg-accent/20 text-accent">
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
           className="mt-3 space-y-5 p-4 rounded-xl bg-muted/30 border border-border"
          >
            {/* Gemini API Key */}
           <div className="space-y-3">
             <Label className="text-sm font-medium flex items-center gap-2">
                <Key className="w-4 h-4 text-accent" />
                Gemini API Key
                {hasGeminiKey && (
                 <Badge variant="outline" className="text-xs h-5 text-accent border-accent/30">
                   <Check className="w-3 h-3 mr-1" /> Configurada
                  </Badge>
                )}
              </Label>
              <div className="relative">
                <Input
                  type={showGeminiKey ? "text" : "password"}
                  value={credentials.geminiApiKey}
                   onChange={(e) => handleGeminiKeyChange(e.target.value)}
                  placeholder="AIzaSy..."
                   className={cn(
                    "h-10 pr-20 font-mono text-sm",
                     geminiValidation === 'valid' && "border-accent focus-visible:ring-accent",
                     geminiValidation === 'invalid' && "border-destructive focus-visible:ring-destructive"
                   )}
                />
                 <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                   {geminiValidation === 'valid' && (
                     <Check className="w-4 h-4 text-accent" />
                   )}
                   {geminiValidation === 'invalid' && (
                     <XCircle className="w-4 h-4 text-destructive" />
                  )}
                   <button
                     type="button"
                     onClick={() => setShowGeminiKey(!showGeminiKey)}
                     className="p-1.5 hover:bg-muted rounded"
                   >
                     {showGeminiKey ? (
                       <EyeOff className="w-4 h-4 text-muted-foreground" />
                     ) : (
                       <Eye className="w-4 h-4 text-muted-foreground" />
                     )}
                   </button>
                 </div>
              </div>
               <div className="flex items-center justify-between mt-2">
                 <p className="text-xs text-muted-foreground">
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
                 <Button
                   type="button"
                   variant="ghost"
                   size="sm"
                   className="h-8 px-3 text-xs"
                   onClick={handleTestGeminiKey}
                   disabled={validatingGemini || !credentials.geminiApiKey.trim()}
                 >
                   {validatingGemini ? (
                     <>
                       <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                       Validando...
                     </>
                   ) : (
                     "Testar Conexão"
                   )}
                 </Button>
               </div>
               
               {/* Validation Status Message */}
               {geminiValidation === 'invalid' && (
                 <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 mt-2">
                   <XCircle className="w-4 h-4 text-destructive" />
                   <p className="text-xs text-destructive">
                     API Key inválida. Verifique se copiou corretamente.
                   </p>
                 </div>
               )}
               
               {geminiValidation === 'valid' && (
                 <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/10 border border-accent/20 mt-2">
                   <Check className="w-4 h-4 text-accent" />
                   <p className="text-xs text-accent">
                     Conexão validada com sucesso!
                   </p>
                 </div>
               )}
            </div>

            {/* ImageFX Cookies */}
           <div className="space-y-3">
             <Label className="text-sm font-medium flex items-center gap-2">
                <Cookie className="w-4 h-4 text-primary" />
                ImageFX Cookies
                {hasCookies && (
                  <Badge variant="outline" className={cn(
                   "text-xs h-5",
                    cookiesValidation === 'valid' ? "text-accent border-accent/30" : 
                    cookiesValidation === 'invalid' ? "text-destructive border-destructive/30" :
                    "text-accent border-accent/30"
                  )}>
                    {cookiesValidation === 'valid' ? (
                     <><Check className="w-3 h-3 mr-1" /> Validados</>
                    ) : cookiesValidation === 'invalid' ? (
                     <><XCircle className="w-3 h-3 mr-1" /> Inválidos</>
                    ) : (
                     <><Check className="w-3 h-3 mr-1" /> Configurados</>
                    )}
                  </Badge>
                )}
              </Label>
              <div className="relative">
                <Textarea
                  value={credentials.imageFxCookies}
                  onChange={(e) => handleCookiesChange(e.target.value)}
                  placeholder="Cole os cookies do ImageFX aqui..."
                  className={cn(
                   "min-h-[100px] font-mono text-sm resize-none",
                    !showCookies && credentials.imageFxCookies && "text-transparent select-none",
                    cookiesValidation === 'valid' && "border-accent focus-visible:ring-accent",
                    cookiesValidation === 'invalid' && "border-destructive focus-visible:ring-destructive"
                  )}
                  style={!showCookies && credentials.imageFxCookies ? { 
                    textShadow: "0 0 8px hsl(var(--foreground))" 
                  } : undefined}
                />
                {credentials.imageFxCookies && (
                  <button
                    type="button"
                    onClick={() => setShowCookies(!showCookies)}
                   className="absolute right-2 top-2 p-1.5 hover:bg-muted rounded bg-background/80"
                  >
                    {showCookies ? (
                     <EyeOff className="w-4 h-4 text-muted-foreground" />
                    ) : (
                     <Eye className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                )}
              </div>
             <div className="flex items-center justify-between mt-2">
               <p className="text-xs text-muted-foreground flex-1">
                  <strong>Como obter:</strong> Abra o ImageFX, pressione F12, vá em Application → Cookies, 
                  e copie todos os cookies.
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                 className="h-8 px-3 text-xs"
                  onClick={handleTestCookies}
                  disabled={validatingCookies || !credentials.imageFxCookies.trim()}
                >
                  {validatingCookies ? (
                    <>
                     <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                      Validando...
                    </>
                  ) : (
                    "Testar Sessão"
                  )}
                </Button>
              </div>
              
              {/* Cookies Validation Status */}
              {cookiesValidation === 'invalid' && (
               <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 mt-2">
                 <XCircle className="w-4 h-4 text-destructive" />
                 <p className="text-xs text-destructive">
                    Cookies inválidos ou expirados. Obtenha novos cookies do ImageFX.
                  </p>
                </div>
              )}
              
              {cookiesValidation === 'valid' && (
               <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/10 border border-accent/20 mt-2">
                 <Check className="w-4 h-4 text-accent" />
                 <p className="text-xs text-accent">
                    Sessão do ImageFX ativa e funcionando!
                  </p>
                </div>
              )}
            </div>

            {/* Save Button */}
            <Button 
              onClick={handleSaveCredentials}
             className="w-full h-10 gap-2 text-sm"
              variant={saved ? "outline" : "default"}
              disabled={validatingGemini || validatingCookies}
            >
              {validatingGemini || validatingCookies ? (
                 <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                   Validando...
                 </>
               ) : saved ? (
                <>
                 <Check className="w-4 h-4" />
                  Credenciais Salvas!
                </>
              ) : (
                <>
                 <Key className="w-4 h-4" />
                  Salvar Credenciais
                </>
              )}
            </Button>

            {/* Security Note */}
           <div className="flex items-start gap-2.5 p-3 rounded-lg bg-muted/50">
             <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
             <p className="text-xs text-muted-foreground">
                Suas credenciais são salvas apenas localmente no seu navegador e nunca são enviadas para servidores externos.
              </p>
            </div>
          </motion.div>
        </CollapsibleContent>
      </Collapsible>

       {/* Model Selection */}
       <div className="space-y-3">
         <Label className="text-sm font-semibold flex items-center gap-2">
           <div className="p-2 rounded-md bg-primary/10">
             <Video className="w-4 h-4 text-primary" />
           </div>
           Modelo de Geração
         </Label>
         <Select value={settings.model} onValueChange={(v: string) => updateSetting('model', v)}>
           <SelectTrigger className="h-10 rounded-lg text-sm">
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
       <div className="space-y-3">
         <Label className="text-sm font-semibold flex items-center gap-2">
           <div className="p-2 rounded-md bg-accent/10">
             <Ratio className="w-4 h-4 text-accent" />
           </div>
           Proporção do Vídeo
         </Label>
         <Select value={settings.ratio} onValueChange={(v: string) => updateSetting('ratio', v)}>
           <SelectTrigger className="h-10 rounded-lg text-sm">
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
       <div className="space-y-3">
         <Label className="text-sm font-semibold flex items-center gap-2">
           <div className="p-2 rounded-md bg-muted">
             <Gauge className="w-4 h-4 text-muted-foreground" />
           </div>
           Vídeos por Tarefa
         </Label>
         <Select 
           value={String(settings.videosPerTask)} 
           onValueChange={(v) => updateSetting('videosPerTask', Number(v))}
         >
           <SelectTrigger className="h-10 rounded-lg text-sm">
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
       <div className="space-y-3">
         <Label className="text-sm font-semibold flex items-center gap-2">
           <div className="p-2 rounded-md bg-muted">
             <Timer className="w-4 h-4 text-muted-foreground" />
           </div>
           Tempo de Espera (segundos)
         </Label>
         <div className="grid grid-cols-2 gap-3">
           <div>
             <Label className="text-xs text-muted-foreground mb-1.5 block">Mínimo</Label>
             <Input
               type="number"
               value={settings.waitTimeMin}
               onChange={(e) => updateSetting('waitTimeMin', Number(e.target.value))}
               className="h-10 rounded-lg text-sm"
               min={5}
               max={300}
             />
           </div>
           <div>
             <Label className="text-xs text-muted-foreground mb-1.5 block">Máximo</Label>
             <Input
               type="number"
               value={settings.waitTimeMax}
               onChange={(e) => updateSetting('waitTimeMax', Number(e.target.value))}
               className="h-10 rounded-lg text-sm"
               min={10}
               max={600}
             />
           </div>
         </div>
       </div>
 
       {/* Auto Download */}
       <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
         <div className="flex items-center gap-3">
           <div className="p-2 rounded-md bg-accent/10">
             <Download className="w-4 h-4 text-accent" />
           </div>
           <div>
             <Label className="text-sm font-medium">Download Automático</Label>
             <p className="text-xs text-muted-foreground">Baixar vídeos ao concluir</p>
           </div>
         </div>
         <Switch
           checked={settings.autoDownload}
           onCheckedChange={(v) => updateSetting('autoDownload', v)}
         />
       </div>
 
       {/* Info */}
       <div className="p-4 rounded-xl bg-muted/50 border border-border">
         <div className="flex items-start gap-2">
           <Settings2 className="w-5 h-5 text-muted-foreground mt-0.5" />
           <div>
             <p className="text-sm font-medium">Configurações Salvas Localmente</p>
             <p className="text-xs text-muted-foreground mt-1">
               Suas preferências são salvas no navegador e persistem entre sessões.
             </p>
           </div>
         </div>
       </div>
     </motion.div>
   );
 }