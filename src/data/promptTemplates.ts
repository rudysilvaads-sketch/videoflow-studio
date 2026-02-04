export interface PromptTemplate {
  id: string;
  name: string;
  category: 'horror' | 'mystery' | 'thriller' | 'paranormal' | 'crime' | 'conspiracy';
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
];

export const categoryLabels: Record<PromptTemplate['category'], string> = {
  horror: "🎃 Terror",
  mystery: "🔍 Mistério",
  thriller: "⚡ Thriller",
  paranormal: "👻 Paranormal",
  crime: "🔪 Crime",
  conspiracy: "🕵️ Conspiração",
};

export const categoryColors: Record<PromptTemplate['category'], string> = {
  horror: "bg-red-500/20 text-red-400 border-red-500/30",
  mystery: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  thriller: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  paranormal: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  crime: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  conspiracy: "bg-green-500/20 text-green-400 border-green-500/30",
};
