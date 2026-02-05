 import { useState, useCallback } from 'react';
 import { supabase } from '@/integrations/supabase/client';
 import { getCredentials } from './useCredentials';
 import { toast } from 'sonner';
 
 interface GenerationResult {
   images: string[];
   seed: number;
 }
 
 interface UseImageFxGenerationReturn {
   generate: (prompt: string, seed?: number) => Promise<GenerationResult | null>;
   isGenerating: boolean;
   error: string | null;
   lastResult: GenerationResult | null;
 }
 
 export function useImageFxGeneration(): UseImageFxGenerationReturn {
   const [isGenerating, setIsGenerating] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [lastResult, setLastResult] = useState<GenerationResult | null>(null);
 
   const generate = useCallback(async (prompt: string, seed?: number): Promise<GenerationResult | null> => {
     const credentials = getCredentials();
 
     if (!credentials.imageFxCookies) {
       const errorMsg = 'Cookies do ImageFX não configurados. Vá em Configurações > APIs & Credenciais.';
       setError(errorMsg);
       toast.error(errorMsg);
       return null;
     }
 
     setIsGenerating(true);
     setError(null);
 
     try {
       console.log('[useImageFxGeneration] Starting generation...');
       
       const { data, error: fnError } = await supabase.functions.invoke('generate-imagefx', {
         body: {
           prompt,
           cookies: credentials.imageFxCookies,
           seed,
         },
       });
 
       if (fnError) {
         throw new Error(fnError.message);
       }
 
       if (data.error) {
         if (data.code === 'COOKIES_EXPIRED') {
           toast.error('Cookies expirados! Atualize nas configurações.');
         }
         throw new Error(data.error);
       }
 
       const result: GenerationResult = {
         images: data.images || [],
         seed: data.seed,
       };
 
       setLastResult(result);
       
       if (result.images.length > 0) {
         toast.success(`${result.images.length} imagens geradas!`);
       } else {
         toast.warning('Nenhuma imagem foi gerada.');
       }
 
       return result;
     } catch (err) {
       const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
       console.error('[useImageFxGeneration] Error:', errorMsg);
       setError(errorMsg);
       toast.error(errorMsg);
       return null;
     } finally {
       setIsGenerating(false);
     }
   }, []);
 
   return {
     generate,
     isGenerating,
     error,
     lastResult,
   };
 }