 import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
 
 const corsHeaders = {
   'Access-Control-Allow-Origin': '*',
   'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
 };
 
 interface GenerateRequest {
   prompt: string;
   cookies: string;
   seed?: number;
 }
 
 serve(async (req) => {
   // Handle CORS preflight requests
   if (req.method === 'OPTIONS') {
     return new Response('ok', { headers: corsHeaders });
   }
 
   try {
     const { prompt, cookies, seed }: GenerateRequest = await req.json();
 
     if (!prompt) {
       return new Response(
         JSON.stringify({ error: 'Prompt is required' }),
         { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
     }
 
     if (!cookies) {
       return new Response(
         JSON.stringify({ error: 'ImageFX cookies are required' }),
         { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
     }
 
     console.log('[ImageFX] Generating image with prompt:', prompt.substring(0, 100) + '...');
     console.log('[ImageFX] Using seed:', seed || 'random');
 
     // ImageFX API endpoint (Google Labs)
     const imageFxUrl = 'https://aisandbox-pa.googleapis.com/v1:runImageFx';
 
     // Build the request payload
     const payload = {
       userInput: {
         candidatesCount: 4,
         prompts: [prompt],
         seed: seed || Math.floor(Math.random() * 2147483647),
       },
       clientContext: {
         sessionId: crypto.randomUUID(),
         tool: "IMAGE_FX",
       },
     };
 
     const response = await fetch(imageFxUrl, {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         'Cookie': cookies,
         'Origin': 'https://labs.google',
         'Referer': 'https://labs.google/',
         'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
       },
       body: JSON.stringify(payload),
     });
 
     if (!response.ok) {
       const errorText = await response.text();
       console.error('[ImageFX] API error:', response.status, errorText);
       
       if (response.status === 401 || response.status === 403) {
         return new Response(
           JSON.stringify({ 
             error: 'Cookies expirados ou inválidos. Atualize seus cookies do ImageFX nas configurações.',
             code: 'COOKIES_EXPIRED' 
           }),
           { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
         );
       }
 
       return new Response(
         JSON.stringify({ error: `ImageFX API error: ${response.status}` }),
         { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       );
     }
 
     const data = await response.json();
     console.log('[ImageFX] Response received, processing images...');
 
     // Extract images from response
     const images: string[] = [];
     
     if (data.imagePanels && Array.isArray(data.imagePanels)) {
       for (const panel of data.imagePanels) {
         if (panel.generatedImages && Array.isArray(panel.generatedImages)) {
           for (const img of panel.generatedImages) {
             if (img.encodedImage) {
               images.push(`data:image/png;base64,${img.encodedImage}`);
             }
           }
         }
       }
     }
 
     console.log(`[ImageFX] Generated ${images.length} images`);
 
     return new Response(
       JSON.stringify({ 
         success: true,
         images,
         seed: payload.userInput.seed,
       }),
       { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
     );
 
   } catch (error: unknown) {
     const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
     console.error('[ImageFX] Error:', errorMessage);
     return new Response(
       JSON.stringify({ error: errorMessage }),
       { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
     );
   }
 });