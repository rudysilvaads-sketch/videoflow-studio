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
 
// Clean and format cookies properly
function formatCookies(rawCookies: string): string {
  // If it's already a single line cookie string, return as-is
  if (!rawCookies.includes('\n') && !rawCookies.includes('\t')) {
    return rawCookies.trim();
  }
  
  // Parse multi-line cookie formats (from DevTools)
  const cookiePairs: string[] = [];
  const lines = rawCookies.split(/[\n\r]+/);
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Handle "name=value" format
    if (trimmed.includes('=')) {
      // Extract just the name=value part (ignore expiry, path, etc.)
      const match = trimmed.match(/^([^=\s]+)=([^;]*)/);
      if (match) {
        const [, name, value] = match;
        // Skip metadata-like entries
        if (!['Expires', 'Path', 'Domain', 'Secure', 'HttpOnly', 'SameSite'].includes(name)) {
          cookiePairs.push(`${name}=${value}`);
        }
      }
    }
  }
  
  return cookiePairs.join('; ');
}

// Check if cookies contain required auth cookies
function validateCookieFormat(cookies: string): { valid: boolean; error?: string } {
  const formatted = formatCookies(cookies);
  
  // Check for some expected Google cookies
  const requiredPatterns = ['SID', 'HSID', 'SSID', '__Secure'];
  const hasAuthCookies = requiredPatterns.some(pattern => formatted.includes(pattern));
  
  if (!hasAuthCookies) {
    return { 
      valid: false, 
      error: 'Cookies incompletos. Certifique-se de copiar TODOS os cookies do ImageFX (incluindo SID, HSID, etc.)' 
    };
  }
  
  return { valid: true };
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
 
    // Format and validate cookies
    const formattedCookies = formatCookies(cookies);
    console.log('[ImageFX] Cookie length after formatting:', formattedCookies.length);
    
    // Basic format validation
    const formatCheck = validateCookieFormat(formattedCookies);
    if (!formatCheck.valid) {
      console.log('[ImageFX] Cookie format validation failed:', formatCheck.error);
      return new Response(
        JSON.stringify({ 
          valid: false,
          error: formatCheck.error,
          code: 'INVALID_FORMAT'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validation-only mode: test if cookies are valid
    if (validateOnly) {
      console.log('[ImageFX] Validating cookies...');
      
     // Try a lightweight request to verify cookies work
     // Using the initialization endpoint which is less resource-intensive
     const testResponse = await fetch('https://aisandbox-pa.googleapis.com/v1:initializeSession', {
       method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
         'Cookie': formattedCookies,
          'Origin': 'https://labs.google',
          'Referer': 'https://labs.google/',
         'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
       body: JSON.stringify({ tool: 'IMAGE_FX' }),
      });

     const responseText = await testResponse.text();
     console.log('[ImageFX] Validation response status:', testResponse.status);
     
     // 404 is OK - means cookies are valid but endpoint doesn't exist
     // 401/403 means cookies are invalid
      if (!testResponse.ok) {
        const status = testResponse.status;
        
       // 404 can mean the endpoint doesn't exist but cookies are valid
       // We need to check with the actual endpoint
       if (status === 404) {
         console.log('[ImageFX] Got 404, trying actual endpoint...');
         
         // Try minimal request to actual endpoint
         const actualTest = await fetch('https://aisandbox-pa.googleapis.com/v1:runImageFx', {
           method: 'POST',
           headers: {
             'Content-Type': 'application/json',
             'Cookie': formattedCookies,
             'Origin': 'https://labs.google',
             'Referer': 'https://labs.google/',
             'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
           },
           body: JSON.stringify({
             userInput: { candidatesCount: 1, prompts: ["test"], seed: 1 },
             clientContext: { sessionId: crypto.randomUUID(), tool: "IMAGE_FX" }
           }),
         });
         
         const actualText = await actualTest.text();
         console.log('[ImageFX] Actual endpoint status:', actualTest.status);
         
         if (actualTest.status === 401 || actualTest.status === 403) {
           return new Response(
             JSON.stringify({ 
               valid: false,
               error: 'Cookies expirados ou inválidos. Atualize seus cookies.',
               code: 'COOKIES_EXPIRED' 
             }),
             { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
           );
         }
         
         // Any other response (including errors) means cookies are working
         console.log('[ImageFX] Cookies appear valid');
         return new Response(
           JSON.stringify({ valid: true }),
           { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
         );
       }
       
       if (status === 401 || status === 403) {
          return new Response(
            JSON.stringify({ 
              valid: false,
              error: 'Cookies expirados ou inválidos.',
              code: 'COOKIES_EXPIRED' 
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ 
            valid: false,
            error: `Erro ao validar: ${status}`,
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('[ImageFX] Cookies validated successfully');
      return new Response(
        JSON.stringify({ valid: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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