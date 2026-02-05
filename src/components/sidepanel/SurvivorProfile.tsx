import { useState } from "react";
import { motion } from "framer-motion";
import { 
  User, 
  Lock, 
  Unlock, 
  Copy, 
  Check,
  Edit3,
  Sparkles,
  Eye,
  EyeOff,
  ImagePlus,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { survivorCharacterTemplate } from "@/data/survivalScenarios";
import { cn } from "@/lib/utils";
import { useImageFxGeneration } from "@/hooks/useImageFxGeneration";
import { useCredentials } from "@/hooks/useCredentials";

interface SurvivorProfileProps {
  profile: {
    name: string;
    basePrompt: string;
    isLocked: boolean;
    visualStyle: string;
    avatarUrl?: string;
    avatarSeed?: number;
  };
  onProfileChange: (profile: {
    name: string;
    basePrompt: string;
    isLocked: boolean;
    visualStyle: string;
    avatarUrl?: string;
    avatarSeed?: number;
  }) => void;
}

export function SurvivorProfile({ profile, onProfileChange }: SurvivorProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showImageGenerator, setShowImageGenerator] = useState(false);

  const { generate, isGenerating, lastResult } = useImageFxGeneration();
  const { hasImageFxCookies } = useCredentials();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profile.basePrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetToDefault = () => {
    onProfileChange({
      name: survivorCharacterTemplate.name,
      basePrompt: survivorCharacterTemplate.basePrompt,
      isLocked: true,
      visualStyle: survivorCharacterTemplate.visualStyle || "",
      avatarUrl: undefined,
      avatarSeed: undefined,
    });
    setIsEditing(false);
  };

  const toggleLock = () => {
    onProfileChange({ ...profile, isLocked: !profile.isLocked });
  };

  const generateAvatar = async () => {
    const portraitPrompt = `Close-up portrait photograph, ${profile.basePrompt}, ${profile.visualStyle}, cinematic lighting, detailed face, shallow depth of field`;
    
    const result = await generate(portraitPrompt);
    
    if (result && result.images.length > 0) {
      onProfileChange({
        ...profile,
        avatarUrl: result.images[0],
        avatarSeed: result.seed,
      });
      setShowImageGenerator(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card overflow-hidden"
    >
      {/* Header */}
      <div className="p-3 bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {profile.avatarUrl ? (
              <img 
                src={profile.avatarUrl} 
                alt={profile.name}
                className="w-10 h-10 rounded-lg object-cover ring-2 ring-primary/30"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <User className="w-5 h-5 text-primary-foreground" />
              </div>
            )}
            <div>
              <h3 className="text-sm font-semibold">{profile.name}</h3>
              <p className="text-[10px] text-muted-foreground">Personagem Principal</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {hasImageFxCookies && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={generateAvatar}
                disabled={isGenerating}
                title="Gerar avatar com ImageFX"
              >
                {isGenerating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                ) : (
                  <ImagePlus className="w-3.5 h-3.5 text-primary" />
                )}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={toggleLock}
            >
              {profile.isLocked ? (
                <Lock className="w-3.5 h-3.5 text-accent" />
              ) : (
                <Unlock className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit3 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Lock Status */}
        <div className="flex items-center gap-2 mt-2">
          <Badge 
            variant={profile.isLocked ? "default" : "secondary"}
            className="text-[10px] h-5"
          >
            {profile.isLocked ? (
              <>
                <Lock className="w-2.5 h-2.5 mr-1" />
                Bloqueado em todos os prompts
              </>
            ) : (
              <>
                <Unlock className="w-2.5 h-2.5 mr-1" />
                Desbloqueado
              </>
            )}
          </Badge>
          {profile.avatarSeed && (
            <Badge variant="outline" className="text-[9px] h-5">
              Seed: {profile.avatarSeed}
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-3">
        {isEditing ? (
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Nome do Personagem</Label>
              <Input
                value={profile.name}
                onChange={(e) => onProfileChange({ ...profile, name: e.target.value })}
                className="mt-1 h-8"
              />
            </div>
            <div>
              <Label className="text-xs">Prompt Base (Descrição Visual)</Label>
              <Textarea
                value={profile.basePrompt}
                onChange={(e) => onProfileChange({ ...profile, basePrompt: e.target.value })}
                className="mt-1 min-h-[120px] text-xs font-mono"
                placeholder="Descrição detalhada do personagem..."
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                💡 Inclua detalhes como idade, roupas, características físicas e expressões.
                Termine com um identificador único entre colchetes para consistência.
              </p>
            </div>
            <div>
              <Label className="text-xs">Estilo Visual</Label>
              <Input
                value={profile.visualStyle}
                onChange={(e) => onProfileChange({ ...profile, visualStyle: e.target.value })}
                className="mt-1 h-8"
                placeholder="Ex: Cinematográfico, tons dessaturados..."
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => setIsEditing(false)} className="flex-1">
                Salvar
              </Button>
              <Button size="sm" variant="outline" onClick={resetToDefault}>
                Restaurar Padrão
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Preview Toggle */}
            <Collapsible open={showPreview} onOpenChange={setShowPreview}>
              <CollapsibleTrigger asChild>
                <button className="w-full flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <span className="text-[10px] font-medium flex items-center gap-1.5">
                    {showPreview ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {showPreview ? "Ocultar Prompt" : "Ver Prompt Base"}
                  </span>
                  <Badge variant="outline" className="text-[9px] h-4">
                    {profile.basePrompt.length} chars
                  </Badge>
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2 p-2 rounded-lg bg-muted/30 border border-border">
                  <p className="text-[10px] font-mono text-muted-foreground leading-relaxed">
                    {profile.basePrompt}
                  </p>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Visual Style */}
            {profile.visualStyle && (
              <div className="flex items-start gap-2 p-2 rounded-lg bg-primary/5 border border-primary/20">
                <Sparkles className="w-3.5 h-3.5 text-primary mt-0.5" />
                <div>
                  <p className="text-[10px] font-medium">Estilo Visual</p>
                  <p className="text-[10px] text-muted-foreground">
                    {profile.visualStyle}
                  </p>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-7 text-[10px]"
                onClick={copyToClipboard}
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 mr-1" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 mr-1" />
                    Copiar Prompt
                  </>
                )}
              </Button>
            </div>

            {/* Consistency Tip */}
            <div className="p-2 rounded-lg bg-accent/10 border border-accent/20">
              <p className="text-[10px] text-accent font-medium">💡 Dica de Consistência</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Mantenha o personagem bloqueado para que ele seja incluído automaticamente 
                em todos os prompts gerados, garantindo consistência visual nos vídeos de 8s.
              </p>
            </div>
              
            {/* Generated Images Preview */}
            {lastResult && lastResult.images.length > 0 && (
              <Collapsible open={showImageGenerator} onOpenChange={setShowImageGenerator}>
                <CollapsibleTrigger asChild>
                  <button className="w-full flex items-center justify-between p-2 rounded-lg bg-primary/10 hover:bg-primary/15 transition-colors">
                    <span className="text-[10px] font-medium flex items-center gap-1.5">
                      <ImagePlus className="w-3 h-3 text-primary" />
                      Imagens Geradas ({lastResult.images.length})
                    </span>
                    <Badge variant="outline" className="text-[9px] h-4">
                      Seed: {lastResult.seed}
                    </Badge>
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-2 grid grid-cols-4 gap-1.5">
                    {lastResult.images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => onProfileChange({ 
                          ...profile, 
                          avatarUrl: img, 
                          avatarSeed: lastResult.seed 
                        })}
                        className={cn(
                          "relative rounded-lg overflow-hidden border-2 transition-all hover:scale-105",
                          profile.avatarUrl === img 
                            ? "border-primary ring-2 ring-primary/30" 
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <img 
                          src={img} 
                          alt={`Avatar option ${index + 1}`}
                          className="w-full aspect-square object-cover"
                        />
                        {profile.avatarUrl === img && (
                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                            <Check className="w-4 h-4 text-primary" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2 text-center">
                    Clique em uma imagem para usar como avatar
                  </p>
                </CollapsibleContent>
              </Collapsible>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}