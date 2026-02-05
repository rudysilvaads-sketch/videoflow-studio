export interface PromptTemplate {
  id: string;
  name: string;
  category: 'horror' | 'mystery' | 'thriller' | 'paranormal' | 'crime' | 'conspiracy' | 'asmr' | 'asmr-survivor';
  description: string;
  prompt: string;
  tags: string[];
}

export const promptTemplates: PromptTemplate[] = [
  // Horror
  {
    id: "horror-1",
    name: "Figura na Escuridão",
    category: "horror",
    description: "Uma silhueta misteriosa observando da escuridão",
    prompt: "standing in complete darkness, only silhouette visible, glowing eyes piercing through shadows, fog creeping at feet, horror atmosphere, cinematic lighting from behind, 8k quality",
    tags: ["silhueta", "escuridão", "terror"],
  },
  {
    id: "horror-2",
    name: "Corredor Abandonado",
    category: "horror",
    description: "Caminhando por um corredor escuro e abandonado",
    prompt: "walking slowly through an abandoned dark corridor, flickering lights, peeling wallpaper, dust particles in air, found footage style, horror movie atmosphere, dramatic shadows",
    tags: ["corredor", "abandonado", "suspense"],
  },
  {
    id: "horror-3",
    name: "Olhar Perturbador",
    category: "horror",
    description: "Close-up com expressão perturbadora",
    prompt: "extreme close-up face shot, unsettling stare directly at camera, one side lit dramatically, dark background, psychological horror mood, subtle smile, uncanny valley effect",
    tags: ["close-up", "perturbador", "psicológico"],
  },

  // Mystery
  {
    id: "mystery-1",
    name: "Investigador Noturno",
    category: "mystery",
    description: "Analisando pistas em ambiente escuro",
    prompt: "examining evidence with flashlight in dark room, concentrated expression, detective noir style, dust particles visible in light beam, mysterious atmosphere, film grain effect",
    tags: ["detetive", "investigação", "noir"],
  },
  {
    id: "mystery-2",
    name: "Documentos Secretos",
    category: "mystery",
    description: "Descobrindo documentos confidenciais",
    prompt: "reading classified documents under dim desk lamp, papers scattered, dramatic shadows on face, conspiracy thriller mood, vintage office setting, night time",
    tags: ["documentos", "segredo", "conspiração"],
  },
  {
    id: "mystery-3",
    name: "Vigilância",
    category: "mystery",
    description: "Observando algo suspeito à distância",
    prompt: "watching from distance through binoculars, hidden in shadows, surveillance operation, thriller atmosphere, urban night setting, street lights in background",
    tags: ["vigilância", "espionagem", "urbano"],
  },

  // Thriller
  {
    id: "thriller-1",
    name: "Fuga Desesperada",
    category: "thriller",
    description: "Correndo desesperadamente de algo",
    prompt: "running desperately through dark alley, looking back in fear, motion blur, rain falling, neon reflections on wet ground, thriller chase scene, cinematic wide shot",
    tags: ["perseguição", "fuga", "ação"],
  },
  {
    id: "thriller-2",
    name: "Confronto Tenso",
    category: "thriller",
    description: "Momento de tensão extrema",
    prompt: "tense standoff moment, dramatic side lighting, sweat on face, shallow depth of field, thriller movie scene, high contrast, holding breath moment",
    tags: ["tensão", "confronto", "drama"],
  },
  {
    id: "thriller-3",
    name: "Revelação Chocante",
    category: "thriller",
    description: "Reação a uma descoberta impactante",
    prompt: "shocked expression discovering something terrible, mouth slightly open, wide eyes, dramatic lighting from below, thriller revelation moment, emotional impact",
    tags: ["choque", "revelação", "emoção"],
  },

  // Paranormal
  {
    id: "paranormal-1",
    name: "Presença Sobrenatural",
    category: "paranormal",
    description: "Sentindo uma presença invisível",
    prompt: "sensing invisible presence, looking at empty corner of room, goosebumps visible, paranormal activity, cold breath visible, supernatural horror, dim ambient lighting",
    tags: ["sobrenatural", "fantasma", "presença"],
  },
  {
    id: "paranormal-2",
    name: "Ritual Misterioso",
    category: "paranormal",
    description: "Realizando ou testemunhando um ritual",
    prompt: "witnessing mysterious ritual, candles providing only light, symbols drawn on floor, hooded figures in background, occult atmosphere, supernatural glow",
    tags: ["ritual", "ocultismo", "velas"],
  },
  {
    id: "paranormal-3",
    name: "Casa Assombrada",
    category: "paranormal",
    description: "Explorando uma casa assombrada",
    prompt: "exploring haunted house interior, old furniture covered in dust, cobwebs everywhere, ghost hunters style, flashlight beam cutting darkness, creaking floor atmosphere",
    tags: ["casa", "assombrado", "exploração"],
  },

  // Crime
  {
    id: "crime-1",
    name: "Cena do Crime",
    category: "crime",
    description: "Analisando uma cena de crime",
    prompt: "analyzing crime scene, police tape in background, forensic investigation mood, flashlights illuminating evidence, true crime documentary style, serious expression",
    tags: ["crime", "forense", "investigação"],
  },
  {
    id: "crime-2",
    name: "Testemunha Oculta",
    category: "crime",
    description: "Escondido observando um crime",
    prompt: "hiding and witnessing crime from shadows, terrified expression, peeking from behind obstacle, crime thriller moment, urban night setting, danger atmosphere",
    tags: ["testemunha", "escondido", "perigo"],
  },
  {
    id: "crime-3",
    name: "Interrogatório",
    category: "crime",
    description: "Cena de interrogatório intenso",
    prompt: "intense interrogation scene, single harsh light from above, sweat dripping, psychological pressure, police station interview room, noir crime drama",
    tags: ["interrogatório", "pressão", "drama"],
  },

  // Conspiracy
  {
    id: "conspiracy-1",
    name: "Teoria Revelada",
    category: "conspiracy",
    description: "Apresentando evidências de conspiração",
    prompt: "presenting conspiracy evidence, wall covered in photos and red strings connecting them, dim lighting, obsessed researcher look, thriller documentary style",
    tags: ["teoria", "evidências", "pesquisa"],
  },
  {
    id: "conspiracy-2",
    name: "Hacker Noturno",
    category: "conspiracy",
    description: "Hackeando sistemas secretos",
    prompt: "hacking into secret systems, multiple monitors glowing in dark room, code reflecting on face, cyberpunk thriller mood, hooded figure, green matrix-like text",
    tags: ["hacker", "tecnologia", "cyber"],
  },
  {
    id: "conspiracy-3",
    name: "Encontro Secreto",
    category: "conspiracy",
    description: "Encontro clandestino com informante",
    prompt: "secret meeting with informant, parking garage at night, single overhead light, exchanging documents, spy thriller atmosphere, paranoid glances around",
    tags: ["encontro", "informante", "espionagem"],
  },
  
  // ASMR
  {
    id: "asmr-1",
    name: "Sussurros Íntimos",
    category: "asmr",
    description: "Close-up com sussurros suaves e relaxantes",
    prompt: "extreme close-up face shot, soft warm lighting, whispering softly, intimate eye contact, cozy bedroom background with fairy lights, shallow depth of field, warm color grade, ASMR aesthetic, calming atmosphere, soft smile",
    tags: ["sussurro", "íntimo", "relaxante"],
  },
  {
    id: "asmr-2",
    name: "Tapping Suave",
    category: "asmr",
    description: "Mãos fazendo tapping em objetos variados",
    prompt: "close-up of hands gently tapping on objects, soft lighting, macro detail on fingernails, wooden surface, glass, plastic items, satisfying repetitive motion, ASMR trigger sounds implied, calm ambient lighting",
    tags: ["tapping", "mãos", "sons"],
  },
  {
    id: "asmr-3",
    name: "Preparação para Dormir",
    category: "asmr",
    description: "Rotina relaxante de preparação para dormir",
    prompt: "cozy bedroom setting, soft pajamas, warm dim lighting, brushing hair slowly, skincare routine, gentle movements, fairy lights background, calm peaceful expression, bedtime ASMR aesthetic, warm neutral tones",
    tags: ["dormir", "rotina", "relaxante"],
  },
  {
    id: "asmr-4",
    name: "Escovando Microfone",
    category: "asmr",
    description: "Close-up de escovação de microfone",
    prompt: "extreme close-up of fluffy microphone being brushed gently, soft makeup brush, slow deliberate movements, blurred cozy background, warm lighting, satisfying texture, ASMR equipment, intimate framing",
    tags: ["microfone", "escova", "textura"],
  },
  {
    id: "asmr-5",
    name: "Unboxing Relaxante",
    category: "asmr",
    description: "Abrindo pacotes de forma lenta e satisfatória",
    prompt: "hands slowly opening package, crisp paper sounds implied, gentle movements, close-up on fingers peeling tape, revealing items inside, soft overhead lighting, clean organized space, satisfying unboxing ASMR",
    tags: ["unboxing", "pacote", "satisfatório"],
  },
  {
    id: "asmr-6",
    name: "Comendo Suavemente",
    category: "asmr",
    description: "Mukbang ASMR com sons de comida",
    prompt: "close-up eating shot, crunchy food, soft chewing sounds implied, variety of textures, clean aesthetic, bright soft lighting, organized food presentation, ASMR eating style, satisfying food textures",
    tags: ["comida", "mukbang", "crunchy"],
  },
  
  // ASMR SURVIVOR
  {
    id: "survivor-1",
    name: "Acendendo Fogueira",
    category: "asmr-survivor",
    description: "Processo relaxante de fazer fogo na natureza",
    prompt: "hands making fire with friction, close-up on wood shavings, smoke starting to rise, forest background, golden hour lighting, survival camping scene, detailed hand work, natural environment, crackling sounds implied",
    tags: ["fogo", "sobrevivência", "natureza"],
  },
  {
    id: "survivor-2",
    name: "Cortando Madeira",
    category: "asmr-survivor",
    description: "Som satisfatório de cortar lenha",
    prompt: "close-up of hands using knife to carve wood, wood shavings curling, forest campsite background, natural daylight through trees, bushcraft activity, detailed texture of wood grain, survival knife technique, calming repetitive motion",
    tags: ["madeira", "cortar", "bushcraft"],
  },
  {
    id: "survivor-3",
    name: "Cozinhando na Fogueira",
    category: "asmr-survivor",
    description: "Preparando comida ao ar livre",
    prompt: "cooking over campfire, close-up on sizzling food in cast iron pan, flames dancing, smoke rising gently, wilderness background, evening golden light, outdoor cooking, survival meal preparation, satisfying cooking sounds",
    tags: ["cozinhar", "fogueira", "comida"],
  },
  {
    id: "survivor-4",
    name: "Construindo Abrigo",
    category: "asmr-survivor",
    description: "Montando abrigo na floresta",
    prompt: "hands tying rope around branches, building shelter in forest, close-up on knot work, natural materials, dappled sunlight, survival shelter construction, bushcraft skills, green forest environment, methodical careful movements",
    tags: ["abrigo", "construção", "corda"],
  },
  {
    id: "survivor-5",
    name: "Purificando Água",
    category: "asmr-survivor",
    description: "Coletando e purificando água do rio",
    prompt: "hands collecting water from stream, pouring water through filter, close-up on clear water flowing, forest stream setting, natural lighting, survival water purification, pristine wilderness, calming water sounds implied",
    tags: ["água", "rio", "purificação"],
  },
  {
    id: "survivor-6",
    name: "Noite na Floresta",
    category: "asmr-survivor",
    description: "Ambiente noturno relaxante na natureza",
    prompt: "nighttime campsite scene, crackling fire illuminating, stars visible through trees, person relaxing by fire, warm orange glow, peaceful wilderness night, distant owl sounds implied, cozy survival camp, ambient nature night",
    tags: ["noite", "floresta", "relaxante"],
  },
  {
    id: "survivor-7",
    name: "Pescando no Rio",
    category: "asmr-survivor",
    description: "Pescaria tranquila em ambiente natural",
    prompt: "hands preparing fishing line, close-up on tying hooks, river flowing in background, peaceful fishing spot, natural daylight, calm water reflections, survival fishing technique, serene wilderness activity",
    tags: ["pesca", "rio", "tranquilo"],
  },
  {
    id: "survivor-8",
    name: "Caminhada na Trilha",
    category: "asmr-survivor",
    description: "POV caminhando pela natureza",
    prompt: "POV walking through forest trail, feet on leaves and twigs, dappled sunlight through canopy, peaceful hiking path, nature sounds implied, crunch of footsteps, wilderness exploration, calming nature walk",
    tags: ["trilha", "caminhada", "pov"],
  },
  // ASMR Roleplay
  {
    id: "asmr-roleplay-1",
    name: "Médico(a) Gentil",
    category: "asmr",
    description: "Consulta médica relaxante e cuidadosa",
    prompt: "caring doctor in white coat, soft examination room lighting, gentle hand gestures, medical equipment visible, calming professional demeanor, POV patient perspective, soft smile, warm ambient lighting, ASMR medical roleplay aesthetic",
    tags: ["roleplay", "médico", "consulta"],
  },
  {
    id: "asmr-roleplay-2",
    name: "Cabeleireiro(a)",
    category: "asmr",
    description: "Sessão relaxante de cuidados com cabelo",
    prompt: "hairdresser brushing hair slowly, salon mirror reflection, soft warm lighting, scissors and combs visible, gentle focused expression, POV client view, hair care products in background, relaxing salon atmosphere",
    tags: ["roleplay", "cabelo", "salão"],
  },
  {
    id: "asmr-roleplay-3",
    name: "Maquiador(a)",
    category: "asmr",
    description: "Aplicação suave de maquiagem no espectador",
    prompt: "makeup artist applying products gently, close-up on hands with brushes, soft studio lighting, makeup palette visible, focused caring expression, POV client perspective, beauty studio background, intimate ASMR setting",
    tags: ["roleplay", "maquiagem", "beleza"],
  },
  {
    id: "asmr-roleplay-4",
    name: "Bibliotecário(a)",
    category: "asmr",
    description: "Ambiente silencioso de biblioteca com sussurros",
    prompt: "librarian among old books, whisper-quiet atmosphere, warm reading lamp light, glasses, cardigan, organizing books carefully, library shelves background, cozy academic aesthetic, soft page turning sounds implied",
    tags: ["roleplay", "biblioteca", "livros"],
  },
  // Atenção Pessoal
  {
    id: "asmr-attention-1",
    name: "Cuidando de Você",
    category: "asmr",
    description: "Atenção pessoal direta e carinhosa",
    prompt: "gentle person giving personal attention, soft hand movements near camera, caring warm expression, fairy lights background, extremely soft lighting, intimate close-up, cozy bedroom setting, soothing presence, ASMR personal attention",
    tags: ["atenção", "cuidado", "íntimo"],
  },
  {
    id: "asmr-attention-2",
    name: "Limpeza Facial",
    category: "asmr",
    description: "Spa facial relaxante com produtos suaves",
    prompt: "spa facial treatment POV, soft cotton pads, gentle cream application, serene spa therapist face, candles glowing, white towels, cucumber slices nearby, ultra soft lighting, zen spa atmosphere, pampering session",
    tags: ["spa", "facial", "relaxante"],
  },
  {
    id: "asmr-attention-3",
    name: "Massagem Craniana",
    category: "asmr",
    description: "Massagem relaxante na cabeça e couro cabeludo",
    prompt: "scalp massage therapy, gentle fingers in hair, soft overhead angle, relaxed peaceful expression, spa treatment room, warm dim lighting, essential oils visible, deeply relaxing atmosphere, ASMR head massage",
    tags: ["massagem", "cabeça", "relaxante"],
  },
  // Variedade de Sons
  {
    id: "asmr-sounds-1",
    name: "Mesa de Triggers",
    category: "asmr",
    description: "Coleção de objetos para sons variados",
    prompt: "overhead view of ASMR trigger collection, organized objects on dark surface, brushes, wooden items, glass bottles, fabric textures, soft studio lighting, hands reaching for items, professional ASMR setup, satisfying arrangement",
    tags: ["triggers", "objetos", "variedade"],
  },
  {
    id: "asmr-sounds-2",
    name: "Texturas Satisfatórias",
    category: "asmr",
    description: "Tocando diferentes texturas relaxantes",
    prompt: "hands touching various textures, macro close-up, soft fabric, smooth wood, cold glass, rough stone, satisfying sensory experience, soft lighting, organized texture collection, ASMR texture exploration",
    tags: ["texturas", "toque", "satisfatório"],
  },
  {
    id: "asmr-sounds-3",
    name: "Sons de Água",
    category: "asmr",
    description: "Água pingando, fluindo e borbulhando",
    prompt: "water sounds setup, glass containers with water, droplets falling, soft ripples, gentle pouring, spa-like water feature, soft blue lighting, close-up on water movement, calming aquatic atmosphere",
    tags: ["água", "gotas", "fluindo"],
  },
];

export const categoryLabels: Record<PromptTemplate['category'], string> = {
  horror: "🎃 Terror",
  mystery: "🔍 Mistério",
  thriller: "⚡ Suspense",
  paranormal: "👻 Paranormal",
  crime: "🔪 Crime",
  conspiracy: "🕵️ Conspiração",
  asmr: "🎧 ASMR",
  "asmr-survivor": "🏕️ ASMR Sobrevivência",
};

export const categoryColors: Record<PromptTemplate['category'], string> = {
  horror: "bg-red-500/20 text-red-400 border-red-500/30",
  mystery: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  thriller: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  paranormal: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  crime: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  conspiracy: "bg-green-500/20 text-green-400 border-green-500/30",
  asmr: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  "asmr-survivor": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};
