 import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
 };
 
 interface Beat {
   name: string;
   description: string;
   emotionalTone: string;
   location?: string;
   sceneCount: number;
 }
 
 serve(async (req) => {
   if (req.method === "OPTIONS") {
     return new Response(null, { headers: corsHeaders });
   }
 
   try {
     const { 
       episodeTitle, 
       episodeDescription, 
       beats, 
       characterPrompt, 
       visualStyle,
       sceneDuration = 8
     } = await req.json();
     
     const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
     if (!LOVABLE_API_KEY) {
       throw new Error("LOVABLE_API_KEY is not configured");
     }
 
     console.log(`Generating scenes for episode: ${episodeTitle}`);
     console.log(`Beats count: ${beats.length}`);
 
     const systemPrompt = `Você é um roteirista especializado em criar cenas cinematográficas para vídeos de ${sceneDuration} segundos.
 
 REGRAS CRÍTICAS:
1. CONSISTÊNCIA ABSOLUTA DO PERSONAGEM:
   - Copie EXATAMENTE a descrição física do personagem em TODAS as cenas
   - Mesma roupa, mesmos acessórios, mesmas características faciais
   - Se o personagem tem "jaqueta marrom surrada", TODAS as cenas devem mencionar "jaqueta marrom surrada"
   - NUNCA altere idade, cor de cabelo, tipo físico ou vestimenta entre cenas

2. CONTINUIDADE CINEMATOGRÁFICA (MATCH-CUT):
   - Se a Cena 1 termina com o personagem olhando para a direita, a Cena 2 começa com ele ainda olhando para a direita
   - Mantenha continuidade de iluminação: se é noite na Cena 3, continua noite até indicar amanhecer
   - Objetos introduzidos devem permanecer (se pegou uma mochila, ela aparece nas cenas seguintes)
   - Use transições naturais: mesmo enquadramento expandindo, câmera seguindo movimento

3. ESTRUTURA DA CENA (${sceneDuration} segundos):
   - UMA ÚNICA AÇÃO simples e lenta
   - Movimento de câmera suave: slow push-in, gentle pan, static contemplative shot
   - Descreva texturas, iluminação, atmosfera
   - Ações apropriadas para ASMR/contemplativo

4. TRANSIÇÕES ENTRE CENAS:
   - Termine cada cena em um ponto que conecta naturalmente à próxima
   - Evite cortes bruscos - prefira continuidade espacial e temporal
   - Se mudar de local, descreva o personagem CHEGANDO ao novo local na primeira cena

FORMATO OBRIGATÓRIO DO PROMPT:
[DESCRIÇÃO FÍSICA COMPLETA DO PERSONAGEM conforme fornecido], [AÇÃO ÚNICA E LENTA], [AMBIENTE E ATMOSFERA], [ILUMINAÇÃO], [MOVIMENTO DE CÂMERA]. [${sceneDuration}s cinematic shot]`;
 
     const beatsDescription = beats.map((b: Beat, i: number) => 
       `Beat ${i + 1}: "${b.name}" (${b.sceneCount} cenas)
        - Descrição: ${b.description}
        - Tom emocional: ${b.emotionalTone}
        ${b.location ? `- Localização: ${b.location}` : ''}`
     ).join('\n\n');
 
     const userPrompt = `EPISÓDIO: ${episodeTitle}
 
 SINOPSE: ${episodeDescription}
 
PERSONAGEM - COPIAR LITERALMENTE EM CADA CENA SEM ALTERAÇÕES:
 ${characterPrompt}
 
⚠️ IMPORTANTE: A descrição acima deve aparecer IDÊNTICA no início de CADA prompt de cena.
Isso inclui: aparência física, roupa, acessórios, idade, etc.

 ESTILO VISUAL: ${visualStyle || 'Cinematográfico, tons dessaturados, atmosfera pós-apocalíptica'}
 
 ESTRUTURA DO EPISÓDIO:
 ${beatsDescription}
 
 Gere os prompts para TODAS as cenas de TODOS os beats, mantendo:
- DESCRIÇÃO FÍSICA IDÊNTICA do personagem em cada prompt (copie literalmente)
- Mesma roupa e acessórios em todas as cenas
- Progressão emocional natural entre beats
- Transições suaves entre cenas (match-cut visual)
- Continuidade de objetos (o que o personagem pega, carrega nas cenas seguintes)
- Iluminação consistente dentro de cada beat
 
 Responda em JSON:
 {
   "beats": [
     {
       "name": "nome do beat",
       "scenes": [
        {"prompt": "[PERSONAGEM COMPLETO], [ação], [ambiente], [iluminação], [câmera]. 8s cinematic shot", "notes": "nota sobre transição para próxima"},
        {"prompt": "[PERSONAGEM COMPLETO], [ação continuando], [mesmo ambiente], [mesma iluminação], [câmera]. 8s cinematic shot", "notes": "nota sobre continuidade"}
       ]
     }
   ]
 }`;
 
     const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
       method: "POST",
       headers: {
         Authorization: `Bearer ${LOVABLE_API_KEY}`,
         "Content-Type": "application/json",
       },
       body: JSON.stringify({
         model: "google/gemini-2.5-flash",
         messages: [
           { role: "system", content: systemPrompt },
           { role: "user", content: userPrompt },
         ],
       }),
     });
 
     if (!response.ok) {
       if (response.status === 429) {
         return new Response(JSON.stringify({ error: "Limite de requisições excedido. Aguarde alguns segundos." }), {
           status: 429,
           headers: { ...corsHeaders, "Content-Type": "application/json" },
         });
       }
       if (response.status === 402) {
         return new Response(JSON.stringify({ error: "Créditos insuficientes." }), {
           status: 402,
           headers: { ...corsHeaders, "Content-Type": "application/json" },
         });
       }
       const errorText = await response.text();
       console.error("AI error:", response.status, errorText);
       throw new Error("Erro na API de IA");
     }
 
     const data = await response.json();
     const content = data.choices?.[0]?.message?.content || "";
     
     console.log("AI response received, parsing...");
     
     let result;
     try {
       result = JSON.parse(content);
     } catch {
       const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
       if (jsonMatch) {
         result = JSON.parse(jsonMatch[1].trim());
       } else {
         const objMatch = content.match(/\{[\s\S]*\}/);
         if (objMatch) {
           result = JSON.parse(objMatch[0]);
         } else {
           throw new Error("Não foi possível extrair cenas da resposta");
         }
       }
     }
 
     console.log(`Generated ${result.beats?.length || 0} beats with scenes`);
 
     return new Response(JSON.stringify(result), {
       headers: { ...corsHeaders, "Content-Type": "application/json" },
     });
   } catch (error) {
     console.error("Error generating episode scenes:", error);
     return new Response(
       JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
       { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
   }
 });