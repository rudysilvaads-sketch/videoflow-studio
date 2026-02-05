 export interface CharacterTemplate {
   id: string;
   name: string;
   description: string;
   basePrompt: string;
   attributes: {
     age?: string;
     gender?: string;
     style?: string;
     features?: string[];
   };
   thumbnail: string;
 }
 
 export const characterTemplates: CharacterTemplate[] = [
   {
     id: "anime-hero",
     name: "Herói de Anime",
     description: "Protagonista jovem com cabelos espetados e olhos brilhantes",
     basePrompt: "young anime hero with spiky hair, determined expression, bright eyes, athletic build, wearing a signature outfit, dynamic pose, high quality anime art style",
     attributes: {
       age: "18 anos",
       gender: "Masculino",
       style: "Anime Clássico, Shonen",
     },
     thumbnail: "🦸",
   },
   {
     id: "cyberpunk-woman",
     name: "Mulher Cyberpunk",
     description: "Hacker futurista com implantes cibernéticos e cabelo neon",
     basePrompt: "cyberpunk woman hacker, neon hair, cybernetic implants, glowing eyes, futuristic clothing, dark urban background, rain, neon lights reflecting, high detail, cinematic lighting",
     attributes: {
       age: "28 anos",
       gender: "Feminino",
       style: "Cyberpunk, Neon Noir",
     },
     thumbnail: "🤖",
   },
   {
     id: "fantasy-wizard",
     name: "Mago Anciã",
     description: "Feiticeiro sábio com barba longa e manto místico",
     basePrompt: "wise elderly wizard, long flowing white beard, mystical robes with runes, staff with glowing crystal, magical aura, wise expression, fantasy art style, detailed illustration",
     attributes: {
       age: "150 anos",
       gender: "Masculino",
       style: "Fantasia Épica, Pintura Digital",
     },
     thumbnail: "🧙",
   },
   {
     id: "steampunk-inventor",
     name: "Inventora Steampunk",
     description: "Engenheira vitoriana com óculos de proteção e engrenagens",
     basePrompt: "steampunk female inventor, brass goggles, Victorian era clothing, mechanical arm, surrounded by gears and gadgets, workshop background, warm lighting, detailed steampunk aesthetic",
     attributes: {
       age: "35 anos",
       gender: "Feminino",
       style: "Steampunk, Vitoriano",
     },
     thumbnail: "⚙️",
   },
   {
     id: "noir-detective",
     name: "Detetive Noir",
     description: "Investigador misterioso de filme noir clássico",
     basePrompt: "film noir detective, fedora hat, trench coat, cigarette smoke, dramatic shadows, black and white with selective color, 1940s aesthetic, mysterious expression, rain-soaked city background",
     attributes: {
       age: "42 anos",
       gender: "Masculino",
       style: "Film Noir, Preto e Branco",
     },
     thumbnail: "🕵️",
   },
   {
     id: "kawaii-idol",
     name: "Idol Kawaii",
     description: "Cantora pop japonesa com visual colorido e fofo",
     basePrompt: "kawaii japanese idol singer, pastel colored outfit, big sparkling eyes, cute pose, heart accessories, stage lighting, confetti, cheerful expression, pop art style, vibrant colors",
     attributes: {
       age: "17 anos",
       gender: "Feminino",
       style: "Kawaii, Pop Art",
     },
     thumbnail: "🎤",
   },
   {
     id: "medieval-knight",
     name: "Cavaleiro Medieval",
     description: "Guerreiro honrado com armadura completa e espada",
     basePrompt: "medieval knight in full plate armor, noble crest on shield, battle-worn sword, honorable stance, castle background, dramatic lighting, realistic fantasy art, highly detailed armor reflections",
     attributes: {
       age: "32 anos",
       gender: "Masculino",
       style: "Realismo, Fantasia Medieval",
     },
     thumbnail: "⚔️",
   },
   {
     id: "sci-fi-alien",
     name: "Alienígena Sci-Fi",
     description: "Ser extraterrestre com características únicas e tecnologia avançada",
     basePrompt: "humanoid alien being, bioluminescent skin patterns, large expressive eyes, advanced alien technology, spaceship interior, otherworldly beauty, sci-fi concept art, detailed creature design",
     attributes: {
       age: "Desconhecida",
       gender: "Não-binário",
       style: "Sci-Fi, Concept Art",
     },
     thumbnail: "👽",
   },
   {
     id: "chibi-mascot",
     name: "Mascote Chibi",
     description: "Personagem super deformado estilo mascote fofo",
     basePrompt: "chibi mascot character, super deformed proportions, oversized head, tiny body, cute round eyes, simple expressive face, cheerful pose, clean lineart, bright colors, mascot design",
     attributes: {
       age: "Atemporal",
       gender: "Neutro",
       style: "Chibi, Kawaii",
     },
     thumbnail: "🐱",
   },
   {
     id: "realistic-portrait",
     name: "Retrato Realista",
     description: "Pessoa fotorrealista com características naturais",
     basePrompt: "photorealistic portrait, natural lighting, detailed skin texture, expressive eyes, professional photography, shallow depth of field, studio quality, high resolution, lifelike details",
     attributes: {
       age: "30 anos",
       gender: "Feminino",
       style: "Fotorrealista, Retrato",
     },
     thumbnail: "📷",
   },
   {
     id: "watercolor-fairy",
     name: "Fada Aquarela",
     description: "Criatura mágica em estilo aquarela delicado",
     basePrompt: "ethereal fairy creature, delicate watercolor art style, translucent wings, flower crown, soft pastel colors, dreamy atmosphere, nature background, whimsical fantasy illustration",
     attributes: {
       age: "Imortal",
       gender: "Feminino",
       style: "Aquarela, Fantasia",
     },
     thumbnail: "🧚",
   },
   {
     id: "comic-superhero",
     name: "Super-herói Comics",
     description: "Herói no estilo clássico de quadrinhos americanos",
     basePrompt: "classic comic book superhero, bold linework, dynamic action pose, cape flowing, muscular build, heroic expression, comic book coloring, halftone dots, vintage comic style",
     attributes: {
       age: "28 anos",
       gender: "Masculino",
       style: "Comics Americano, Pop Art",
     },
     thumbnail: "💪",
   },
 ];