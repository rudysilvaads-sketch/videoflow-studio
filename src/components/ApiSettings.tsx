import { useState } from "react";
import { ApiConfig } from "@/types/character";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Key, Shield, Zap } from "lucide-react";
import { toast } from "sonner";

interface ApiSettingsProps {
  config: ApiConfig;
  onSave: (config: ApiConfig) => void;
  onClose: () => void;
}

export function ApiSettings({ config, onSave, onClose }: ApiSettingsProps) {
  const [formData, setFormData] = useState<ApiConfig>(config);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.primaryApiKey.trim()) {
      toast.error("A API Key principal é obrigatória");
      return;
    }

    onSave(formData);
    toast.success("Configurações salvas!");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-card border-border animate-scale-in">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              Configurações de API
            </CardTitle>
            <CardDescription className="mt-1">
              Configure suas chaves de API para geração de imagens
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="primaryKey" className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                API Key Principal (Google Flow)
              </Label>
              <Input
                id="primaryKey"
                type="password"
                placeholder="sk-..."
                value={formData.primaryApiKey}
                onChange={(e) => setFormData(prev => ({ ...prev, primaryApiKey: e.target.value }))}
                className="bg-muted border-border font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fallbackKey" className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-muted-foreground" />
                API Key de Fallback (Backup)
              </Label>
              <Input
                id="fallbackKey"
                type="password"
                placeholder="sk-... (opcional)"
                value={formData.fallbackApiKey}
                onChange={(e) => setFormData(prev => ({ ...prev, fallbackApiKey: e.target.value }))}
                className="bg-muted border-border font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Será usado automaticamente se a API principal falhar
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="model">Modelo</Label>
                <Select 
                  value={formData.model} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, model: v }))}
                >
                  <SelectTrigger className="bg-muted border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="imagen-3">Imagen 3</SelectItem>
                    <SelectItem value="imagen-2">Imagen 2</SelectItem>
                    <SelectItem value="stable-diffusion">Stable Diffusion</SelectItem>
                    <SelectItem value="dall-e-3">DALL-E 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="retries">Tentativas Máximas</Label>
                <Select 
                  value={String(formData.maxRetries)} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, maxRetries: parseInt(v) }))}
                >
                  <SelectTrigger className="bg-muted border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 tentativa</SelectItem>
                    <SelectItem value="2">2 tentativas</SelectItem>
                    <SelectItem value="3">3 tentativas</SelectItem>
                    <SelectItem value="5">5 tentativas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" variant="glow">
                Salvar Configurações
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
