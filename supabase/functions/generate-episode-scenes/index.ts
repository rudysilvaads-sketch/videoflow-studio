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
 1. Cada cena deve ser UMA ÚNICA AÇÃO ou momento visual que funciona em ${sceneDuration} segundos
 2. NUNCA inclua múltiplas ações numa cena - apenas uma
 3. Mantenha CONSISTÊNCIA TOTAL do personagem entre cenas (mesma aparência, roupas, características)
 4. Descreva ações lentas e cinematográficas (apropriadas para ASMR/atmosfera)
 5. Inclua detalhes sensoriais: texturas, iluminação, sons ambiente
 6. Cada prompt deve ser autocontido mas conectado narrativamente
 7. Use movimentos de câmera suaves: slow push-in, gentle pan, static contemplative shot
 
 FORMATO DO PROMPT DE CENA:
 [PERSONAGEM fazendo AÇÃO ÚNICA no AMBIENTE]. [Detalhes visuais e atmosféricos]. [Movimento de câmera]. [${sceneDuration}s]`;
 
     const beatsDescription = beats.map((b: Beat, i: number) => 
       `Beat ${i + 1}: "${b.name}" (${b.sceneCount} cenas)
        - Descrição: ${b.description}
        - Tom emocional: ${b.emotionalTone}
        ${b.location ? `- Localização: ${b.location}` : ''}`
     ).join('\n\n');
 
     const userPrompt = `EPISÓDIO: ${episodeTitle}
 
 SINOPSE: ${episodeDescription}
 
 PERSONAGEM (usar EXATAMENTE esta descrição em TODAS as cenas):
 ${characterPrompt}
 
 ESTILO VISUAL: ${visualStyle || 'Cinematográfico, tons dessaturados, atmosfera pós-apocalíptica'}
 
 ESTRUTURA DO EPISÓDIO:
 ${beatsDescription}
 
 Gere os prompts para TODAS as cenas de TODOS os beats, mantendo:
 - Consistência visual do personagem
 - Progressão emocional entre beats
 - Conexão narrativa entre cenas
 - Detalhes sensoriais para cada ambiente
 
 Responda em JSON:
 {
   "beats": [
     {
       "name": "nome do beat",
       "scenes": [
         {"prompt": "prompt completo da cena 1", "notes": "nota sobre a cena"},
         {"prompt": "prompt completo da cena 2", "notes": "nota sobre a cena"}
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