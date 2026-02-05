 import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
 
 const corsHeaders = {
   'Access-Control-Allow-Origin': '*',
   'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
 };
 
const SYSTEM_PROMPT_DEFAULT = `Você é um especialista em direção de fotografia e cinematografia para vídeos de IA.
 
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
 
const SYSTEM_PROMPT_ASMR = `Você é um especialista em criação de conteúdo ASMR (Autonomous Sensory Meridian Response) e vídeos relaxantes para IA.

Seu foco é criar configurações cinematográficas OTIMIZADAS PARA ASMR, priorizando:
- Iluminação suave e acolhedora (nunca dura ou fria)
- Close-ups extremos em mãos, objetos e detalhes
- Movimentos de câmera lentos ou estáticos
- Atmosfera íntima e relaxante
- Sons característicos de ASMR (tapping, scratching, whispering, etc)
- Cores quentes e neutras que acalmam
- Ambientes cozy e organizados

Para conteúdo ASMR SURVIVOR/BUSHCRAFT, priorize:
- Sons da natureza (fogo crepitando, água correndo, pássaros)
- Atividades manuais detalhadas (cortar madeira, fazer fogo, cozinhar)
- Iluminação natural ou de fogueira
- Ambiente de floresta/acampamento
- Movimentos lentos e metodicos

Você DEVE retornar um JSON válido com os seguintes campos (todos opcionais, inclua apenas os relevantes):

{
  "physicalDescription": "Descrição física do personagem se mencionado",
  "hairDescription": "Descrição do cabelo",
  "accessories": "Acessórios distintivos",
  "makeup": "Maquiagem (para ASMR: natural/suave)",
  "outfit": "Roupa (para ASMR: confortável, acolhedora)",
  "props": "Objetos/props (IMPORTANTE para triggers ASMR)",
  "bodyLanguage": "Linguagem corporal (movimentos lentos e deliberados)",
  "shotType": "Tipo de shot (Close-up extremo, macro, overhead são ideais para ASMR)",
  "lensStyle": "Estilo de lente (shallow DOF, macro, soft focus)",
  "cameraMovement": "Movimento de câmera (static ou muito lento para ASMR)",
  "focusDescription": "Descrição do foco (foco seletivo em mãos/objetos)",
  "lightingSetup": "Setup de iluminação (SEMPRE suave e quente para ASMR)",
  "keyLight": "Luz principal (soft, warm, wrapped)",
  "fillLight": "Luz de preenchimento (suave, sem sombras duras)",
  "backLight": "Contraluz (rim light suave, fairy lights)",
  "environmentalLighting": "Efeitos de luz ambiente (velas, fairy lights, fogueira)",
  "locationDescription": "Descrição do cenário (cozy para indoor, natureza para outdoor)",
  "backgroundElements": "Elementos de fundo (organizados, aesthetic, não distrativos)",
  "atmosphericEffects": "Efeitos atmosféricos (névoa suave, partículas de luz)",
  "ambientSound": "Som ambiente (CRUCIAL para ASMR - natureza, silêncio, white noise)",
  "sfx": "Efeitos sonoros (TRIGGERS ASMR: tapping, scratching, crinkling, water, fire)",
  "dialogue": "Diálogo (sussurros suaves ou sem fala)",
  "colorPalette": "Paleta de cores (tons quentes, neutros, pastéis)",
  "visualStyle": "Estilo visual (soft, dreamy, cozy, intimate)",
  "negativePrompt": "Instruções negativas (EVITAR: luz dura, cores frias, movimentos rápidos, ruídos altos)"
}

DICAS ESPECÍFICAS:
- Para ASMR tradicional: fairy lights, microfone, quarto aconchegante, maquiagem suave
- Para ASMR Survivor: fogueira, floresta, ferramentas de bushcraft, sons naturais
- Para ASMR Cooking: overhead shots, ingredientes coloridos, sons de preparo
- Para ASMR Natureza: macro na natureza, sons de água/vento/pássaros

Seja criativo e detalhado. Priorize a experiência sensorial relaxante.
Responda APENAS com o JSON, sem explicações adicionais.`;

// Keywords to detect ASMR content
const ASMR_KEYWORDS = [
  'asmr', 'sussurro', 'whisper', 'relaxante', 'relaxing', 'tapping', 'scratching',
  'survivor', 'bushcraft', 'fogueira', 'campfire', 'natureza', 'nature sounds',
  'cozy', 'aconchegante', 'calming', 'sleep', 'dormir', 'spa', 'massage',
  'mukbang', 'eating sounds', 'cooking asmr', 'rain sounds', 'chuva',
  'floresta', 'forest', 'sobrevivência', 'camping', 'acampamento',
  'meditation', 'meditação', 'triggers', 'tingles', 'satisfying'
];

function detectASMRContent(description: string): boolean {
  const lowerDescription = description.toLowerCase();
  return ASMR_KEYWORDS.some(keyword => lowerDescription.includes(keyword));
}

// Gemini API direct endpoint
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

async function callGeminiDirect(apiKey: string, prompt: string, isASMR: boolean): Promise<string> {
  console.log('Using direct Gemini API', isASMR ? '(ASMR mode)' : '');
  
  const systemPrompt = isASMR ? SYSTEM_PROMPT_ASMR : SYSTEM_PROMPT_DEFAULT;
  
  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: systemPrompt },
            { text: `\n\nGere configurações cinematográficas${isASMR ? ' ASMR otimizadas' : ''} para: ${prompt}` }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini API error:', response.status, errorText);
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!content) {
    throw new Error('No content in Gemini response');
  }
  
  return content;
}

async function callLovableAI(apiKey: string, prompt: string, isASMR: boolean): Promise<string> {
  console.log('Using Lovable AI Gateway', isASMR ? '(ASMR mode)' : '');
  
  const systemPrompt = isASMR ? SYSTEM_PROMPT_ASMR : SYSTEM_PROMPT_DEFAULT;
  
  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-3-flash-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Gere configurações cinematográficas${isASMR ? ' ASMR otimizadas' : ''} para: ${prompt}` }
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('AI Gateway error:', response.status, errorText);
    
    if (response.status === 429) {
      throw new Error('RATE_LIMIT');
    }
    if (response.status === 402) {
      throw new Error('CREDITS_EXHAUSTED');
    }
    
    throw new Error(`AI Gateway error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  if (!content) {
    throw new Error('No content in AI response');
  }
  
  return content;
}

 serve(async (req) => {
   // Handle CORS preflight
   if (req.method === 'OPTIONS') {
     return new Response('ok', { headers: corsHeaders });
   }
 
   try {
     const { description } = await req.json();
     
     if (!description || typeof description !== 'string') {
       return new Response(
         JSON.stringify({ error: 'Description is required' }),
         { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
     }
 
     console.log('Generating cinematography for:', description);
 
    // Detect if this is ASMR content
    const isASMR = detectASMRContent(description);
    console.log('ASMR content detected:', isASMR);

    // Check for custom Gemini API key first, then fallback to Lovable AI
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    let content: string;
    
    try {
      if (GEMINI_API_KEY) {
       try {
         content = await callGeminiDirect(GEMINI_API_KEY, description, isASMR);
       } catch (geminiError) {
         // Fallback to Lovable AI if Gemini fails
         console.log('Gemini API failed, falling back to Lovable AI:', geminiError instanceof Error ? geminiError.message : 'Unknown error');
         if (LOVABLE_API_KEY) {
           content = await callLovableAI(LOVABLE_API_KEY, description, isASMR);
         } else {
           throw geminiError;
         }
       }
      } else if (LOVABLE_API_KEY) {
       content = await callLovableAI(LOVABLE_API_KEY, description, isASMR);
      } else {
        throw new Error('No API key configured. Please add GEMINI_API_KEY or enable Lovable AI.');
      }
    } catch (apiError) {
      if (apiError instanceof Error) {
        if (apiError.message === 'RATE_LIMIT') {
          return new Response(
            JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        if (apiError.message === 'CREDITS_EXHAUSTED') {
          return new Response(
            JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
            { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
      throw apiError;
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