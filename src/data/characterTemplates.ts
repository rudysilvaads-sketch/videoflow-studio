 export interface CharacterTemplate {
   id: string;
   name: string;
  category: string;
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
 
 export const templateCategories = [
   "Todos",
   "Fantasia",
   "Sci-Fi",
   "Horror",
   "Anime",
   "Histórico",
   "Realista",
  "ASMR",
 ] as const;
 
 export type TemplateCategory = typeof templateCategories[number];
 
 export const getTemplatesByCategory = (category: TemplateCategory): CharacterTemplate[] => {
   if (category === "Todos") return characterTemplates;
   return characterTemplates.filter(t => t.category === category);
 };
 
 export const characterTemplates: CharacterTemplate[] = [
   {
     id: "anime-hero",
     name: "Herói de Anime",
     category: "Anime",
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
     category: "Sci-Fi",
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
     category: "Fantasia",
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
     category: "Sci-Fi",
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
     category: "Histórico",
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
     category: "Anime",
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
     category: "Fantasia",
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
     category: "Sci-Fi",
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
     category: "Anime",
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
     category: "Realista",
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
     category: "Fantasia",
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
     category: "Anime",
     description: "Herói no estilo clássico de quadrinhos americanos",
     basePrompt: "classic comic book superhero, bold linework, dynamic action pose, cape flowing, muscular build, heroic expression, comic book coloring, halftone dots, vintage comic style",
     attributes: {
       age: "28 anos",
       gender: "Masculino",
       style: "Comics Americano, Pop Art",
     },
     thumbnail: "💪",
   },
 {
   id: "horror-creature",
   name: "Criatura de Horror",
   category: "Horror",
   description: "Entidade sombria e aterrorizante das trevas",
   basePrompt: "horror creature, grotesque features, dark atmosphere, glowing eyes in shadows, decaying flesh, elongated limbs, nightmare fuel, horror art style, dramatic lighting, unsettling presence",
   attributes: {
     age: "Ancestral",
     gender: "Indefinido",
     style: "Horror, Dark Fantasy",
   },
   thumbnail: "👹",
 },
 {
   id: "western-cowboy",
   name: "Cowboy do Velho Oeste",
   category: "Histórico",
   description: "Pistoleiro durão do faroeste americano",
   basePrompt: "rugged western cowboy, worn leather hat, dusty poncho, revolver holster, stubble beard, weathered face, desert sunset background, spaghetti western style, cinematic composition",
   attributes: {
     age: "38 anos",
     gender: "Masculino",
     style: "Western, Cinematográfico",
   },
   thumbnail: "🤠",
 },
 {
   id: "gothic-vampire",
   name: "Vampiro Gótico",
   category: "Horror",
   description: "Nobre imortal da era vitoriana com sede de sangue",
   basePrompt: "gothic vampire aristocrat, pale skin, crimson eyes, fangs visible, Victorian era elegant clothing, dark castle background, candlelight, blood red accents, romantic gothic horror aesthetic",
   attributes: {
     age: "500 anos",
     gender: "Masculino",
     style: "Gótico, Vitoriano",
   },
   thumbnail: "🧛",
 },
 {
   id: "post-apocalyptic-survivor",
   name: "Sobrevivente Pós-Apocalíptico",
   category: "Sci-Fi",
   description: "Guerreiro endurecido pelo mundo devastado",
   basePrompt: "post-apocalyptic survivor, makeshift armor from scrap, gas mask, scars and dirt, wasteland background, rusted vehicles, orange dust atmosphere, gritty realistic style, survival gear",
   attributes: {
     age: "34 anos",
     gender: "Feminino",
     style: "Pós-Apocalíptico, Grunge",
   },
   thumbnail: "☢️",
 },
 {
   id: "samurai-warrior",
   name: "Samurai Guerreiro",
   category: "Histórico",
   description: "Nobre guerreiro japonês com honra inabalável",
   basePrompt: "traditional samurai warrior, ornate armor with clan crest, katana sword, top knot hairstyle, cherry blossom petals falling, Japanese castle background, ukiyo-e inspired, dramatic pose",
   attributes: {
     age: "45 anos",
     gender: "Masculino",
     style: "Arte Japonesa, Ukiyo-e",
   },
   thumbnail: "⚔️",
 },
 {
   id: "witch-dark",
   name: "Bruxa das Sombras",
   category: "Horror",
   description: "Feiticeira misteriosa com poderes ocultos",
   basePrompt: "dark witch sorceress, flowing black robes, glowing magical runes, familiar black cat, cauldron with green mist, full moon background, mystical forest, dark fantasy illustration, ethereal lighting",
   attributes: {
     age: "Desconhecida",
     gender: "Feminino",
     style: "Dark Fantasy, Gótico",
   },
   thumbnail: "🧙‍♀️",
 },
 {
   id: "robot-android",
   name: "Androide Avançado",
   category: "Sci-Fi",
   description: "Robô humanóide com inteligência artificial",
   basePrompt: "advanced humanoid android, sleek metallic body, glowing blue circuits, partially visible internal mechanisms, neutral expression, futuristic laboratory, clean sci-fi aesthetic, highly detailed mechanical parts",
   attributes: {
     age: "3 anos (fabricação)",
     gender: "Androide",
     style: "Sci-Fi, Hard Surface",
   },
   thumbnail: "🤖",
 },
 {
   id: "pirate-captain",
   name: "Capitã Pirata",
   category: "Histórico",
   description: "Corsária destemida dos sete mares",
   basePrompt: "fierce pirate captain, tricorn hat with feather, ornate coat, cutlass sword, eye patch, ship deck background, stormy sea, golden age of piracy, adventurous expression, dramatic lighting",
   attributes: {
     age: "32 anos",
     gender: "Feminino",
     style: "Aventura, Histórico",
   },
   thumbnail: "🏴‍☠️",
 },
 {
   id: "lovecraftian-entity",
   name: "Entidade Lovecraftiana",
   category: "Horror",
   description: "Horror cósmico incompreensível além da realidade",
   basePrompt: "lovecraftian cosmic horror entity, tentacles, impossible geometry, multiple eyes, otherworldly presence, deep space background, eldritch horror, sanity-breaking visage, dark cosmic colors, surreal nightmare",
   attributes: {
     age: "Eterno",
     gender: "Incompreensível",
     style: "Horror Cósmico, Surreal",
   },
   thumbnail: "🐙",
 },
 {
   id: "forest-elf",
   name: "Elfo da Floresta",
   category: "Fantasia",
   description: "Guardião imortal das florestas ancestrais",
   basePrompt: "forest elf ranger, pointed ears, elegant elven armor with leaf motifs, longbow, flowing hair, ancient forest background, magical sunlight filtering through trees, fantasy art, ethereal beauty",
   attributes: {
     age: "300 anos",
     gender: "Feminino",
     style: "Alta Fantasia, Élfico",
   },
   thumbnail: "🧝",
 },
 {
   id: "demon-lord",
   name: "Senhor Demônio",
   category: "Fantasia",
   description: "Governante infernal com poderes das trevas",
   basePrompt: "demon lord ruler, massive curved horns, burning eyes, dark regal armor, throne of bones, hellfire background, intimidating presence, dark fantasy, ominous red and black color scheme",
   attributes: {
     age: "Milenar",
     gender: "Masculino",
     style: "Dark Fantasy, Infernal",
   },
   thumbnail: "😈",
 },
 {
   id: "1920s-flapper",
   name: "Dançarina dos Anos 20",
   category: "Histórico",
   description: "Mulher glamourosa da era do jazz",
   basePrompt: "1920s flapper dancer, art deco style, sequined dress with fringe, feather headband, pearl necklace, bob haircut, jazz club background, warm golden lighting, vintage glamour, gatsby era aesthetic",
   attributes: {
     age: "24 anos",
     gender: "Feminino",
     style: "Art Deco, Vintage",
   },
   thumbnail: "💃",
 },
 {
   id: "viking-berserker",
   name: "Viking Berserker",
   category: "Histórico",
   description: "Guerreiro nórdico feroz em fúria de batalha",
   basePrompt: "viking berserker warrior, braided beard, war paint, fur cloak, battle axe, scarred muscular body, snowy mountain background, northern lights, fierce battle cry expression, nordic runes",
   attributes: {
     age: "35 anos",
     gender: "Masculino",
     style: "Nórdico, Histórico",
   },
   thumbnail: "🪓",
 },
 {
   id: "mermaid-queen",
   name: "Rainha Sereia",
   category: "Fantasia",
   description: "Soberana majestosa dos reinos submarinos",
   basePrompt: "mermaid queen, iridescent tail scales, coral crown, flowing underwater hair, bioluminescent jewelry, deep ocean palace background, magical underwater lighting, ethereal beauty, fantasy illustration",
   attributes: {
     age: "Imortal",
     gender: "Feminino",
     style: "Fantasia Aquática, Etéreo",
   },
   thumbnail: "🧜‍♀️",
 },
 {
   id: "zombie-survivor",
   name: "Sobrevivente Zumbi",
   category: "Horror",
   description: "Lutador resiliente em apocalipse zumbi",
   basePrompt: "zombie apocalypse survivor, blood-stained clothing, baseball bat weapon, exhausted but determined expression, abandoned city background, overcast sky, horror survival aesthetic, realistic gritty style",
   attributes: {
     age: "29 anos",
     gender: "Masculino",
     style: "Horror, Sobrevivência",
   },
   thumbnail: "🧟",
 },
  // ASMR Characters
  {
    id: "asmr-artist",
   name: "Artista ASMR",
    category: "ASMR",
    description: "Criadora de conteúdo ASMR com visual suave e acolhedor",
    basePrompt: "young woman ASMR content creator, soft natural makeup, gentle warm expression, cozy sweater, fairy lights background, soft warm lighting, intimate close-up framing, calming presence, whisper-ready pose, microphone nearby",
    attributes: {
      age: "25 anos",
      gender: "Feminino",
      style: "ASMR, Cozy Aesthetic",
    },
    thumbnail: "🎧",
  },
  {
    id: "survival-expert",
   name: "Especialista em Sobrevivência",
    category: "ASMR",
    description: "Expert em sobrevivência para canais ASMR Survivor",
    basePrompt: "rugged outdoor survivalist, practical outdoor clothing, weathered hands, calm focused expression, forest background, natural lighting, bushcraft equipment, survival knife on belt, experienced woodsman appearance",
    attributes: {
      age: "35 anos",
      gender: "Masculino",
      style: "Bushcraft, Outdoor",
    },
    thumbnail: "🏕️",
  },
  {
    id: "cozy-host",
    name: "Host Aconchegante",
    category: "ASMR",
    description: "Apresentador(a) de vídeos relaxantes e aconchegantes",
    basePrompt: "gentle person in comfortable home setting, soft cardigan, warm cup of tea, reading glasses, calm knowing smile, bookshelf background, soft lamp lighting, cozy home aesthetic, approachable friendly demeanor",
    attributes: {
      age: "30 anos",
      gender: "Neutro",
      style: "Cozy, Comfort",
    },
    thumbnail: "☕",
  },
  {
    id: "nature-guide",
   name: "Guia de Natureza",
    category: "ASMR",
    description: "Explorador tranquilo da natureza selvagem",
    basePrompt: "calm nature guide, earth-toned hiking clothes, binoculars around neck, gentle observant eyes, forest or meadow background, golden hour natural lighting, peaceful outdoor explorer, connected with nature",
    attributes: {
      age: "40 anos",
      gender: "Masculino",
      style: "Nature, Documentary",
    },
    thumbnail: "🌲",
  },
  {
    id: "spa-therapist",
    name: "Terapeuta de Spa",
    category: "ASMR",
    description: "Profissional de bem-estar e relaxamento",
    basePrompt: "serene spa therapist, clean white uniform, gentle healing hands, peaceful calming expression, zen spa background, soft diffused lighting, candles and plants, wellness aesthetic, soothing presence",
    attributes: {
      age: "32 anos",
      gender: "Feminino",
      style: "Spa, Wellness",
    },
    thumbnail: "🧘",
  },
  {
    id: "campfire-chef",
    name: "Chef de Fogueira",
    category: "ASMR",
    description: "Cozinheiro especialista em culinária outdoor",
    basePrompt: "outdoor cooking enthusiast, casual camping attire, skilled hands preparing food, warm friendly expression, campfire and forest background, evening golden light, cast iron cookware, rustic outdoor chef",
    attributes: {
      age: "38 anos",
      gender: "Masculino",
      style: "Outdoor Cooking, Bushcraft",
    },
    thumbnail: "🍳",
  },
 ];