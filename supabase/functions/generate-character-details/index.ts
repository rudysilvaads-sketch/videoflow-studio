 import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
 };
 
 serve(async (req) => {
   if (req.method === "OPTIONS") {
     return new Response(null, { headers: corsHeaders });
   }
 
   try {
     const { description, name } = await req.json();
     const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
     
     if (!LOVABLE_API_KEY) {
       throw new Error("LOVABLE_API_KEY is not configured");
     }
 
     const systemPrompt = `Você é um especialista em criar descrições detalhadas de personagens para geração de imagens e vídeos com IA.
 Dado uma descrição básica, você deve preencher TODOS os campos de detalhes físicos para garantir consistência visual máxima entre diferentes gerações.
 
 Responda APENAS com JSON válido no formato especificado, sem markdown ou explicações.`;
 
     const userPrompt = `Descrição do personagem "${name}": ${description}
 
 Preencha todos os campos abaixo com detalhes específicos e visuais. Seja criativo mas consistente:
 
 {
   "faceShape": "formato do rosto (oval, angular, quadrado, etc)",
   "skinTone": "tom de pele detalhado",
   "eyeColor": "cor dos olhos com detalhes",
   "eyeShape": "formato dos olhos",
   "eyebrows": "descrição das sobrancelhas",
   "nose": "formato do nariz",
   "lips": "descrição dos lábios",
   "facialHair": "barba/bigode ou 'limpo'",
   "facialMarks": "cicatrizes, sinais, sardas ou 'nenhum'",
   "hairStyle": "estilo do cabelo",
   "hairColor": "cor do cabelo",
   "hairLength": "comprimento do cabelo",
   "hairTexture": "textura (liso, ondulado, cacheado, crespo)",
   "bodyType": "tipo físico",
   "height": "altura aproximada",
   "age": "idade aparente",
   "posture": "postura corporal típica",
   "topClothing": "roupa superior",
   "bottomClothing": "roupa inferior",
   "footwear": "calçados",
   "outerLayer": "camada externa (jaqueta, casaco, etc) ou 'nenhum'",
   "accessories": "acessórios que carrega",
   "jewelry": "joias/bijuterias ou 'nenhum'",
   "headwear": "chapéu/boné ou 'nenhum'",
   "defaultExpression": "expressão facial padrão",
   "bodyLanguage": "linguagem corporal típica",
   "distinctiveFeatures": "características únicas que o identificam",
   "characterId": "identificador único curto em CAPS (ex: THE SURVIVOR, DARK HUNTER)"
 }`;
 
     const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
       method: "POST",
       headers: {
         Authorization: `Bearer ${LOVABLE_API_KEY}`,
         "Content-Type": "application/json",
       },
       body: JSON.stringify({
         model: "google/gemini-3-flash-preview",
         messages: [
           { role: "system", content: systemPrompt },
           { role: "user", content: userPrompt },
         ],
       }),
     });
 
     if (!response.ok) {
       if (response.status === 429) {
         return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }), {
           status: 429,
           headers: { ...corsHeaders, "Content-Type": "application/json" },
         });
       }
       if (response.status === 402) {
         return new Response(JSON.stringify({ error: "Créditos insuficientes. Adicione créditos à sua conta." }), {
           status: 402,
           headers: { ...corsHeaders, "Content-Type": "application/json" },
         });
       }
       const errorText = await response.text();
       console.error("AI gateway error:", response.status, errorText);
       throw new Error("Erro na API de IA");
     }
 
     const data = await response.json();
     const content = data.choices?.[0]?.message?.content || "";
     
     // Extrair JSON da resposta
     let details;
     try {
       // Tenta parse direto
       details = JSON.parse(content);
     } catch {
       // Tenta extrair JSON de markdown
       const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
       if (jsonMatch) {
         details = JSON.parse(jsonMatch[1].trim());
       } else {
         // Tenta encontrar objeto JSON na resposta
         const objMatch = content.match(/\{[\s\S]*\}/);
         if (objMatch) {
           details = JSON.parse(objMatch[0]);
         } else {
           throw new Error("Não foi possível extrair detalhes da resposta");
         }
       }
     }
 
     return new Response(JSON.stringify({ details }), {
       headers: { ...corsHeaders, "Content-Type": "application/json" },
     });
   } catch (error) {
     console.error("Error generating character details:", error);
     return new Response(
       JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
       { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
   }
 });