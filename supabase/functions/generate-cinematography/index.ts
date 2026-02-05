 import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
 
 const corsHeaders = {
   'Access-Control-Allow-Origin': '*',
   'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
 };
 
 const SYSTEM_PROMPT = `Você é um especialista em direção de fotografia e cinematografia para vídeos de IA.
 
 Seu trabalho é gerar configurações cinematográficas detalhadas baseadas na descrição do usuário.
 
 Você DEVE retornar um JSON válido com os seguintes campos (todos opcionais, inclua apenas os relevantes):
 
 {
   "physicalDescription": "Descrição física do personagem se mencionado",
   "hairDescription": "Descrição do cabelo",
   "accessories": "Acessórios distintivos",
   "makeup": "Maquiagem",
   "outfit": "Roupa",
   "props": "Objetos/props",
   "bodyLanguage": "Linguagem corporal",
   "shotType": "Tipo de shot (Medium shot, Close-up, Wide shot, etc)",
   "lensStyle": "Estilo de lente (35mm cinematic, anamorphic, etc)",
   "cameraMovement": "Movimento de câmera (handheld, dolly, static, etc)",
   "focusDescription": "Descrição do foco",
   "lightingSetup": "Setup de iluminação",
   "keyLight": "Luz principal",
   "fillLight": "Luz de preenchimento",
   "backLight": "Contraluz",
   "environmentalLighting": "Efeitos de luz ambiente",
   "locationDescription": "Descrição do cenário",
   "backgroundElements": "Elementos de fundo",
   "atmosphericEffects": "Efeitos atmosféricos",
   "ambientSound": "Som ambiente",
   "sfx": "Efeitos sonoros",
   "dialogue": "Diálogo",
   "colorPalette": "Paleta de cores",
   "visualStyle": "Estilo visual",
   "negativePrompt": "Instruções negativas (o que evitar)"
 }
 
 Seja criativo e detalhado. Use termos técnicos de cinematografia.
 Responda APENAS com o JSON, sem explicações adicionais.`;
 
 serve(async (req) => {
   // Handle CORS preflight
   if (req.method === 'OPTIONS') {
     return new Response('ok', { headers: corsHeaders });
   }
 
   try {
     const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
     if (!LOVABLE_API_KEY) {
       console.error('LOVABLE_API_KEY not configured');
       throw new Error('LOVABLE_API_KEY is not configured');
     }
 
     const { description } = await req.json();
     
     if (!description || typeof description !== 'string') {
       return new Response(
         JSON.stringify({ error: 'Description is required' }),
         { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
     }
 
     console.log('Generating cinematography for:', description);
 
     const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${LOVABLE_API_KEY}`,
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({
         model: 'google/gemini-3-flash-preview',
         messages: [
           { role: 'system', content: SYSTEM_PROMPT },
           { role: 'user', content: `Gere configurações cinematográficas para: ${description}` }
         ],
         temperature: 0.7,
       }),
     });
 
     if (!response.ok) {
       const errorText = await response.text();
       console.error('AI Gateway error:', response.status, errorText);
       
       if (response.status === 429) {
         return new Response(
           JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
           { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
         );
       }
       
       if (response.status === 402) {
         return new Response(
           JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
           { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
         );
       }
       
       throw new Error(`AI Gateway error: ${response.status}`);
     }
 
     const data = await response.json();
     const content = data.choices?.[0]?.message?.content;
     
     if (!content) {
       throw new Error('No content in AI response');
     }
 
     console.log('AI Response:', content);
 
     // Parse the JSON from the response
     let settings;
     try {
       // Try to extract JSON from the response (in case there's extra text)
       const jsonMatch = content.match(/\{[\s\S]*\}/);
       if (jsonMatch) {
         settings = JSON.parse(jsonMatch[0]);
       } else {
         settings = JSON.parse(content);
       }
     } catch (parseError) {
       console.error('Failed to parse AI response as JSON:', parseError);
       throw new Error('Failed to parse AI response');
     }
 
     return new Response(
       JSON.stringify({ settings }),
       { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
     );
 
   } catch (error) {
     console.error('Error in generate-cinematography:', error);
     return new Response(
       JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
       { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
     );
   }
 });