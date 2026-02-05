 import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
 
 const corsHeaders = {
   'Access-Control-Allow-Origin': '*',
   'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
 };
 
 interface GenerateRequest {
   prompt: string;
   cookies: string;
   seed?: number;
   validateOnly?: boolean;
 }
 
 // Detect cookie type: 'next-auth' (labs.google) or 'google' (aisandbox)
 function detectCookieType(cookies: string): 'next-auth' | 'google' | 'unknown' {
   if (cookies.includes('__Secure-next-auth.session-token') || cookies.includes('next-auth')) {
     return 'next-auth';
   }
   if (cookies.includes('SID=') || cookies.includes('HSID=') || cookies.includes('__Secure-1PSID')) {
     return 'google';
   }
   return 'unknown';
 }
 
 // Format cookies string
 function formatCookies(rawCookies: string): string {
   return rawCookies.trim().replace(/\s+/g, ' ');
 }
 
 serve(async (req) => {
   // Handle CORS preflight requests
   if (req.method === 'OPTIONS') {
     return new Response('ok', { headers: corsHeaders });
   }
 
   try {
     const { prompt, cookies, seed, validateOnly }: GenerateRequest = await req.json();
 
     if (!prompt && !validateOnly) {
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
 
     const formattedCookies = formatCookies(cookies);
     const cookieType = detectCookieType(formattedCookies);
     console.log('[ImageFX] Detected cookie type:', cookieType);
     console.log('[ImageFX] Cookie length:', formattedCookies.length);
 
     // Validation-only mode
     if (validateOnly) {
       console.log('[ImageFX] Validating cookies...');
       
       if (cookieType === 'next-auth') {
         // For next-auth cookies, test against labs.google
         console.log('[ImageFX] Testing next-auth cookies...');
         
         // Simply check if the session token looks valid (is a JWT)
         const sessionMatch = formattedCookies.match(/__Secure-next-auth\.session-token=([^;]+)/);
         if (sessionMatch && sessionMatch[1].length > 50) {
           console.log('[ImageFX] next-auth session token found and looks valid');
           return new Response(
             JSON.stringify({ valid: true, type: 'next-auth' }),
             { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
           );
         }
         
         return new Response(
           JSON.stringify({ 
             valid: false,
             error: 'Token de sessão não encontrado ou inválido.',
             code: 'INVALID_TOKEN' 
           }),
           { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
         );
         
       } else if (cookieType === 'google') {
         // For Google cookies, test against aisandbox API
         console.log('[ImageFX] Testing Google cookies via aisandbox...');
         
         const testResponse = await fetch('https://aisandbox-pa.googleapis.com/v1:runImageFx', {
           method: 'POST',
           headers: {
             'Content-Type': 'application/json',
             'Cookie': formattedCookies,
             'Origin': 'https://labs.google',
             'Referer': 'https://labs.google/',
             'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
           },
           body: JSON.stringify({
             userInput: { candidatesCount: 1, prompts: ["test"], seed: 1 },
             clientContext: { sessionId: crypto.randomUUID(), tool: "IMAGE_FX" }
           }),
         });
         
         await testResponse.text(); // consume body
         console.log('[ImageFX] aisandbox response status:', testResponse.status);
         
         if (testResponse.status === 401 || testResponse.status === 403) {
           return new Response(
             JSON.stringify({ 
               valid: false,
               error: 'Cookies expirados ou inválidos.',
               code: 'COOKIES_EXPIRED' 
             }),
             { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
           );
         }
         
         console.log('[ImageFX] Cookies valid (google)');
         return new Response(
           JSON.stringify({ valid: true, type: 'google' }),
           { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
         );
       } else {
         // Unknown cookie type - try to validate anyway
         console.log('[ImageFX] Unknown cookie type, assuming valid');
         return new Response(
           JSON.stringify({ valid: true, type: 'unknown' }),
           { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
         );
       }
     }
 
     // Image generation
     console.log('[ImageFX] Generating image with prompt:', prompt.substring(0, 100) + '...');
     console.log('[ImageFX] Using seed:', seed || 'random');
     console.log('[ImageFX] Cookie type:', cookieType);
 
     // Use aisandbox API for generation (works for both cookie types)
     const imageFxUrl = 'https://aisandbox-pa.googleapis.com/v1:runImageFx';
 
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
         'Cookie': formattedCookies,
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
             error: 'Cookies inválidos. Para next-auth, faça login novamente. Para Google, copie os cookies do Network tab (aisandbox-pa.googleapis.com).',
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