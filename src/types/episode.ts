 export interface Episode {
   id: string;
   title: string;
   description: string;
   targetDuration: number; // em minutos (8-16)
   sceneDuration: number; // segundos por cena (default 8)
   beats: NarrativeBeat[];
   characterId?: string;
   visualStyle?: string;
   createdAt: Date;
   updatedAt: Date;
 }
 
 export interface NarrativeBeat {
   id: string;
   name: string;
   description: string;
   emotionalTone: string;
   location?: string;
   scenes: EpisodeScene[];
   order: number;
   targetSceneCount?: number;
 }
 
 export interface EpisodeScene {
   id: string;
   beatId: string;
   prompt: string;
   sceneNumber: number;
   status: 'pending' | 'generating' | 'completed' | 'error';
   notes?: string;
 }
 
 export interface EpisodeStats {
   totalScenes: number;
   completedScenes: number;
   totalDuration: number; // em segundos
   estimatedMinutes: number;
 }
 
 export const BEAT_TEMPLATES = [
   { name: "Abertura", description: "Estabelecer o mundo e o protagonista", emotionalTone: "contemplativo" },
   { name: "Incidente", description: "Algo quebra a rotina", emotionalTone: "tensão" },
   { name: "Exploração", description: "Investigar ou buscar recursos", emotionalTone: "suspense" },
   { name: "Confronto", description: "Enfrentar perigo ou obstáculo", emotionalTone: "intenso" },
   { name: "Consequência", description: "Lidar com resultado da ação", emotionalTone: "reflexivo" },
   { name: "Preparação", description: "Planejar próximo movimento", emotionalTone: "determinado" },
   { name: "Clímax", description: "Momento de maior tensão", emotionalTone: "dramático" },
   { name: "Resolução", description: "Novo equilíbrio ou gancho", emotionalTone: "esperança/mistério" },
 ];
 
 // Templates de Episódios pré-configurados
 export interface EpisodeTemplate {
   id: string;
   title: string;
   description: string;
   icon: string;
   color: string;
   targetDuration: number;
   beats: {
     name: string;
     description: string;
     emotionalTone: string;
     sceneCount: number;
     location?: string;
   }[];
 }
 
 export const EPISODE_TEMPLATES: EpisodeTemplate[] = [
   {
     id: "ep-first-night",
     title: "A Primeira Noite",
     description: "Sobrevivendo à primeira noite sozinho no mundo pós-apocalíptico",
     icon: "🌙",
     color: "from-indigo-500 to-purple-600",
     targetDuration: 10,
     beats: [
       { name: "Despertar", description: "Acordando em ambiente desconhecido", emotionalTone: "contemplativo", sceneCount: 8 },
       { name: "Reconhecimento", description: "Avaliando a situação e recursos", emotionalTone: "tensão", sceneCount: 10 },
       { name: "Busca por Abrigo", description: "Procurando local seguro antes do anoitecer", emotionalTone: "suspense", sceneCount: 15 },
       { name: "Preparação", description: "Montando abrigo e acendendo fogo", emotionalTone: "determinado", sceneCount: 12 },
       { name: "Vigília Noturna", description: "Enfrentando sons e sombras da noite", emotionalTone: "intenso", sceneCount: 15 },
       { name: "Primeiro Amanhecer", description: "Sobreviveu - novo dia começa", emotionalTone: "esperança/mistério", sceneCount: 15 },
     ]
   },
   {
     id: "ep-abandoned-city",
     title: "Ruínas da Civilização",
     description: "Explorando uma cidade abandonada em busca de suprimentos",
     icon: "🏚️",
     color: "from-stone-500 to-slate-600",
     targetDuration: 12,
     beats: [
       { name: "Aproximação", description: "Chegando aos limites da cidade morta", emotionalTone: "contemplativo", sceneCount: 10 },
       { name: "Entrada Cautelosa", description: "Primeiros passos nas ruas vazias", emotionalTone: "suspense", sceneCount: 12 },
       { name: "Vasculhando", description: "Procurando suprimentos em prédios", emotionalTone: "tensão", sceneCount: 18 },
       { name: "Descoberta", description: "Encontrando algo importante ou perigoso", emotionalTone: "intenso", sceneCount: 15 },
       { name: "Fuga ou Coleta", description: "Pegando o que pode e saindo", emotionalTone: "dramático", sceneCount: 15 },
       { name: "Retorno", description: "Voltando ao abrigo com suprimentos", emotionalTone: "reflexivo", sceneCount: 20 },
     ]
   },
   {
     id: "ep-storm-survival",
     title: "A Tempestade",
     description: "Sobrevivendo a uma tempestade violenta no abrigo",
     icon: "⛈️",
     color: "from-slate-600 to-blue-700",
     targetDuration: 10,
     beats: [
       { name: "Sinais", description: "Percebendo a tempestade se aproximando", emotionalTone: "tensão", sceneCount: 10 },
       { name: "Preparação Urgente", description: "Reforçando abrigo e estocando", emotionalTone: "determinado", sceneCount: 12 },
       { name: "Impacto", description: "A tempestade chega com força total", emotionalTone: "intenso", sceneCount: 18 },
       { name: "Resistência", description: "Mantendo o abrigo inteiro durante a fúria", emotionalTone: "dramático", sceneCount: 15 },
       { name: "Calmaria", description: "A tempestade passa, avaliando danos", emotionalTone: "reflexivo", sceneCount: 10 },
       { name: "Reconstrução", description: "Começando a reparar e reorganizar", emotionalTone: "esperança/mistério", sceneCount: 10 },
     ]
   },
   {
     id: "ep-water-quest",
     title: "Em Busca de Água",
     description: "Jornada arriscada em busca de uma fonte de água potável",
     icon: "💧",
     color: "from-cyan-500 to-blue-600",
     targetDuration: 12,
     beats: [
       { name: "Escassez", description: "Água acabando, decisão de partir", emotionalTone: "contemplativo", sceneCount: 10 },
       { name: "Jornada", description: "Caminhando sob sol forte", emotionalTone: "tensão", sceneCount: 15 },
       { name: "Pista", description: "Encontrando sinais de água próxima", emotionalTone: "suspense", sceneCount: 12 },
       { name: "Obstáculo", description: "Enfrentando perigo para alcançar a fonte", emotionalTone: "intenso", sceneCount: 15 },
       { name: "Descoberta", description: "Finalmente encontrando água limpa", emotionalTone: "reflexivo", sceneCount: 12 },
       { name: "Retorno", description: "Voltando com água para o abrigo", emotionalTone: "esperança/mistério", sceneCount: 26 },
     ]
   },
   {
     id: "ep-rainy-night",
     title: "Noite de Chuva",
     description: "Sons relaxantes de chuva no abrigo - foco em ASMR",
     icon: "🌧️",
     color: "from-slate-500 to-blue-500",
     targetDuration: 16,
     beats: [
       { name: "Entardecer", description: "Nuvens se formando no horizonte", emotionalTone: "contemplativo", sceneCount: 15 },
       { name: "Primeiras Gotas", description: "Chuva começando suave", emotionalTone: "reflexivo", sceneCount: 20 },
       { name: "Chuva Constante", description: "Som hipnótico da chuva no telhado", emotionalTone: "contemplativo", sceneCount: 30 },
       { name: "Rotina no Abrigo", description: "Tarefas calmas enquanto chove", emotionalTone: "reflexivo", sceneCount: 25 },
       { name: "Chuva Intensa", description: "Pico de intensidade relaxante", emotionalTone: "contemplativo", sceneCount: 20 },
       { name: "Calmaria", description: "Chuva diminuindo, sono chegando", emotionalTone: "esperança/mistério", sceneCount: 10 },
     ]
   },
   {
     id: "ep-campfire-night",
     title: "Noite na Fogueira",
     description: "Sons de fogo crepitando e natureza noturna",
     icon: "🔥",
     color: "from-orange-500 to-red-600",
     targetDuration: 14,
     beats: [
       { name: "Acendendo o Fogo", description: "Preparando lenha e iniciando chamas", emotionalTone: "determinado", sceneCount: 15 },
       { name: "Chamas Crescendo", description: "Fogo ganhando força", emotionalTone: "contemplativo", sceneCount: 18 },
       { name: "Preparando Comida", description: "Cozinhando sobre brasas", emotionalTone: "reflexivo", sceneCount: 20 },
       { name: "Noite Estrelada", description: "Contemplando o céu noturno", emotionalTone: "contemplativo", sceneCount: 22 },
       { name: "Sons da Noite", description: "Ouvindo a floresta ao redor", emotionalTone: "suspense", sceneCount: 15 },
       { name: "Brasas", description: "Fogo baixando, hora de dormir", emotionalTone: "esperança/mistério", sceneCount: 15 },
     ]
   },
   {
     id: "ep-forest-walk",
     title: "Caminhada na Floresta",
     description: "Exploração tranquila da natureza - sons de passos e ambiente",
     icon: "🌲",
     color: "from-green-500 to-emerald-600",
     targetDuration: 12,
     beats: [
       { name: "Saindo do Abrigo", description: "Início da jornada matinal", emotionalTone: "contemplativo", sceneCount: 12 },
       { name: "Trilha na Floresta", description: "Caminhando entre árvores", emotionalTone: "reflexivo", sceneCount: 18 },
       { name: "Riacho", description: "Encontrando água corrente", emotionalTone: "contemplativo", sceneCount: 15 },
       { name: "Clareira", description: "Momento de descanso ao sol", emotionalTone: "reflexivo", sceneCount: 15 },
       { name: "Coleta", description: "Recolhendo recursos naturais", emotionalTone: "determinado", sceneCount: 15 },
       { name: "Retorno", description: "Voltando pelo caminho conhecido", emotionalTone: "esperança/mistério", sceneCount: 15 },
     ]
   },
   {
     id: "ep-unknown-threat",
     title: "Ameaça Desconhecida",
     description: "Algo está rondando o abrigo durante a noite",
     icon: "👁️",
     color: "from-red-600 to-rose-700",
     targetDuration: 10,
     beats: [
       { name: "Rotina Normal", description: "Preparando-se para dormir", emotionalTone: "contemplativo", sceneCount: 10 },
       { name: "Primeiro Sinal", description: "Um som estranho lá fora", emotionalTone: "tensão", sceneCount: 12 },
       { name: "Investigação", description: "Tentando identificar a origem", emotionalTone: "suspense", sceneCount: 15 },
       { name: "Aproximação", description: "Algo está se aproximando", emotionalTone: "intenso", sceneCount: 15 },
       { name: "Confronto", description: "Momento de maior tensão", emotionalTone: "dramático", sceneCount: 12 },
       { name: "Silêncio", description: "Perigo passou? Vigilância continua", emotionalTone: "reflexivo", sceneCount: 11 },
     ]
   },
   {
     id: "ep-the-chase",
     title: "A Perseguição",
     description: "Fugindo de algo ou alguém através do território hostil",
     icon: "🏃",
     color: "from-amber-500 to-red-600",
     targetDuration: 8,
     beats: [
       { name: "Descoberta", description: "Percebendo que foi detectado", emotionalTone: "tensão", sceneCount: 10 },
       { name: "Fuga", description: "Correndo para sobreviver", emotionalTone: "intenso", sceneCount: 15 },
       { name: "Esconderijo", description: "Tentando se esconder", emotionalTone: "suspense", sceneCount: 12 },
       { name: "Perigo Próximo", description: "Quase sendo encontrado", emotionalTone: "dramático", sceneCount: 10 },
       { name: "Escapada", description: "Conseguindo escapar finalmente", emotionalTone: "reflexivo", sceneCount: 8 },
       { name: "Segurança", description: "Chegando a um local seguro", emotionalTone: "esperança/mistério", sceneCount: 5 },
     ]
   },
 ];