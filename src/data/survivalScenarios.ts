 import { Scenario, ScenarioCategory } from "@/types/series";
 
 export const scenarioCategories: Record<ScenarioCategory, { name: string; icon: string; color: string }> = {
   shelter: { name: "Abrigo & Construção", icon: "🏚️", color: "from-amber-500 to-orange-600" },
   exploration: { name: "Exploração", icon: "🧭", color: "from-emerald-500 to-teal-600" },
   survival: { name: "Sobrevivência", icon: "🔥", color: "from-red-500 to-orange-600" },
   weather: { name: "Clima & Ambiente", icon: "🌧️", color: "from-slate-500 to-blue-600" },
   ruins: { name: "Ruínas & Cidades", icon: "🏛️", color: "from-stone-500 to-slate-600" },
   nature: { name: "Natureza Selvagem", icon: "🌲", color: "from-green-500 to-emerald-600" },
 };
 
 export const survivalScenarios: Scenario[] = [
   // === ABRIGO & CONSTRUÇÃO ===
   {
     id: "shelter-cave",
     name: "Caverna Natural",
     description: "Abrigo temporário em caverna rochosa",
     category: "shelter",
     environment: "Interior de caverna natural com paredes de rocha úmida, luz entrando pela abertura",
     details: "Formações rochosas, musgo nas paredes, gotejamento de água, chão de terra batida",
     suggestedSounds: ["Gotejamento de água ecoando", "Vento na entrada da caverna", "Passos em pedra"],
     suggestedWeather: ["Chuva lá fora", "Noite fria"],
     suggestedActions: ["Acendendo fogueira", "Organizando suprimentos", "Descansando"],
     icon: "🕳️"
   },
   {
     id: "shelter-makeshift",
     name: "Abrigo Improvisado",
     description: "Construção de abrigo com galhos e lonas",
     category: "shelter",
     environment: "Clareira na floresta, estrutura de galhos sendo montada com lona e cordas",
     details: "Troncos caídos, folhagem densa, ferramentas rústicas, mochila de sobrevivência",
     suggestedSounds: ["Galhos quebrando", "Lona sendo esticada", "Pássaros ao fundo", "Folhas farfalhando"],
     suggestedWeather: ["Entardecer", "Céu nublado ameaçando chuva"],
     suggestedActions: ["Amarrando nós", "Cortando galhos", "Testando estrutura"],
     icon: "🏕️"
   },
   {
     id: "shelter-abandoned-cabin",
     name: "Cabana Abandonada",
     description: "Cabana de madeira em ruínas parciais",
     category: "shelter",
     environment: "Interior de cabana de madeira abandonada, janelas quebradas, móveis tombados",
     details: "Poeira flutuando na luz, teias de aranha, piso de madeira rangendo, lareira apagada",
     suggestedSounds: ["Madeira rangendo", "Vento pelas frestas", "Passos cautelosos"],
     suggestedWeather: ["Noite", "Tempestade se aproximando"],
     suggestedActions: ["Bloqueando entradas", "Acendendo lareira", "Vasculhando suprimentos"],
     icon: "🛖"
   },
   {
     id: "shelter-treehouse",
     name: "Refúgio nas Árvores",
     description: "Plataforma elevada entre árvores grandes",
     category: "shelter",
     environment: "Plataforma de madeira construída entre galhos grossos de árvores antigas",
     details: "Vista da copa das árvores, cordas de acesso, lona como teto, altura segura do chão",
     suggestedSounds: ["Vento nas folhas", "Galhos balançando", "Pássaros ao amanhecer"],
     suggestedWeather: ["Amanhecer dourado", "Névoa matinal"],
     suggestedActions: ["Subindo por corda", "Observando horizonte", "Preparando equipamentos"],
     icon: "🌳"
   },
 
   // === EXPLORAÇÃO ===
   {
     id: "explore-forest-path",
     name: "Trilha na Floresta",
     description: "Caminhando por trilha coberta de vegetação",
     category: "exploration",
     environment: "Trilha estreita em floresta densa, luz filtrada pelas copas das árvores",
     details: "Raízes expostas, folhas secas no chão, troncos caídos, cogumelos em decomposição",
     suggestedSounds: ["Passos em folhas secas", "Galhos estalando", "Pássaros distantes", "Riacho ao longe"],
     suggestedWeather: ["Luz dourada da tarde", "Névoa leve"],
     suggestedActions: ["Caminhando cautelosamente", "Parando para ouvir", "Marcando caminho"],
     icon: "🥾"
   },
   {
     id: "explore-riverbank",
     name: "Margem do Rio",
     description: "Seguindo o curso de um rio em busca de recursos",
     category: "exploration",
     environment: "Margem rochosa de rio de águas claras, vegetação densa nas bordas",
     details: "Pedras lisas, água corrente, peixes visíveis, plantas aquáticas",
     suggestedSounds: ["Água corrente", "Pedras rolando", "Aves aquáticas"],
     suggestedWeather: ["Dia ensolarado", "Reflexos na água"],
     suggestedActions: ["Atravessando pedras", "Enchendo cantil", "Pescando"],
     icon: "🏞️"
   },
   {
     id: "explore-mountain-pass",
     name: "Passagem na Montanha",
     description: "Atravessando terreno montanhoso acidentado",
     category: "exploration",
     environment: "Trilha íngreme em montanha rochosa, vista panorâmica do vale abaixo",
     details: "Rochas soltas, precipícios, vegetação alpina escassa, vento forte",
     suggestedSounds: ["Vento forte", "Pedras deslizando", "Respiração pesada", "Eco distante"],
     suggestedWeather: ["Céu limpo", "Nuvens abaixo", "Sol intenso"],
     suggestedActions: ["Escalando", "Descansando em saliência", "Observando vale"],
     icon: "⛰️"
   },
 
   // === SOBREVIVÊNCIA ===
   {
     id: "survival-campfire",
     name: "Fogueira Noturna",
     description: "Mantendo o fogo aceso durante a noite",
     category: "survival",
     environment: "Acampamento noturno com fogueira crepitando, escuridão total ao redor",
     details: "Chamas dançantes, brasas brilhantes, fumaça subindo, sombras projetadas",
     suggestedSounds: ["Fogo crepitando", "Madeira estalando", "Insetos noturnos", "Corujas ao longe"],
     suggestedWeather: ["Noite estrelada", "Frio intenso"],
     suggestedActions: ["Alimentando o fogo", "Aquecendo as mãos", "Cozinhando"],
     icon: "🔥"
   },
   {
     id: "survival-water-collect",
     name: "Coleta de Água",
     description: "Coletando e purificando água para sobrevivência",
     category: "survival",
     environment: "Fonte natural de água limpa, equipamentos de filtragem improvisados",
     details: "Cantil, tecido para filtrar, recipientes, água cristalina",
     suggestedSounds: ["Água escorrendo", "Líquido enchendo recipiente", "Natureza calma"],
     suggestedWeather: ["Manhã clara", "Orvalho nas plantas"],
     suggestedActions: ["Filtrando água", "Fervendo para purificar", "Armazenando"],
     icon: "💧"
   },
   {
     id: "survival-hunting-trap",
     name: "Armadilha de Caça",
     description: "Montando armadilha para capturar presas",
     category: "survival",
     environment: "Trilha de animais na floresta, materiais para armadilha espalhados",
     details: "Galhos flexíveis, cordas de fibra natural, isca, rastros de animais",
     suggestedSounds: ["Trabalho manual", "Cordas sendo trançadas", "Floresta silenciosa"],
     suggestedWeather: ["Manhã nebulosa", "Luz suave"],
     suggestedActions: ["Montando armadilha", "Camuflando", "Verificando rastros"],
     icon: "🪤"
   },
   {
     id: "survival-food-prep",
     name: "Preparação de Alimentos",
     description: "Preparando comida sobre o fogo",
     category: "survival",
     environment: "Acampamento com fogo baixo, utensílios rústicos, alimentos sendo preparados",
     details: "Espeto sobre brasas, panela de metal, legumes e caça, vapor subindo",
     suggestedSounds: ["Gordura chiando", "Fogo baixo", "Metal raspando", "Mastigação"],
     suggestedWeather: ["Entardecer", "Luz alaranjada do fogo"],
     suggestedActions: ["Virando espeto", "Mexendo panela", "Provando comida"],
     icon: "🍖"
   },
 
   // === CLIMA & AMBIENTE ===
   {
     id: "weather-rain-shelter",
     name: "Chuva no Abrigo",
     description: "Esperando a chuva passar em local protegido",
     category: "weather",
     environment: "Interior de abrigo improvisado, chuva forte caindo lá fora, goteiras ocasionais",
     details: "Água escorrendo pela lona, poças se formando, trovões distantes, escuridão",
     suggestedSounds: ["Chuva forte em lona", "Trovões", "Goteiras", "Vento uivando"],
     suggestedWeather: ["Tempestade intensa", "Relâmpagos ocasionais"],
     suggestedActions: ["Consertando goteiras", "Observando a chuva", "Aquecendo-se"],
     icon: "🌧️"
   },
   {
     id: "weather-morning-mist",
     name: "Névoa Matinal",
     description: "Acordando em acampamento coberto de névoa",
     category: "weather",
     environment: "Acampamento ao amanhecer, névoa densa reduzindo visibilidade, silêncio profundo",
     details: "Orvalho em tudo, vegetação molhada, visibilidade de poucos metros, luz difusa",
     suggestedSounds: ["Silêncio profundo", "Gotas caindo de folhas", "Passos abafados pela névoa"],
     suggestedWeather: ["Névoa densa", "Amanhecer"],
     suggestedActions: ["Levantando acampamento", "Secando equipamentos", "Orientando-se"],
     icon: "🌫️"
   },
   {
     id: "weather-thunderstorm",
     name: "Tempestade Elétrica",
     description: "Enfrentando tempestade com raios",
     category: "weather",
     environment: "Terreno aberto durante tempestade, relâmpagos iluminando a paisagem",
     details: "Céu negro, raios frequentes, chuva horizontal, busca desesperada por abrigo",
     suggestedSounds: ["Trovões intensos", "Chuva torrencial", "Vento cortante", "Raios próximos"],
     suggestedWeather: ["Tempestade severa", "Noite"],
     suggestedActions: ["Correndo para abrigo", "Agachando-se", "Protegendo suprimentos"],
     icon: "⛈️"
   },
   {
     id: "weather-cold-night",
     name: "Noite Gelada",
     description: "Sobrevivendo a uma noite de frio intenso",
     category: "weather",
     environment: "Abrigo mínimo em noite de frio extremo, respiração visível, tremores",
     details: "Geada se formando, fogueira pequena, cobertores improvisados, estrelas brilhantes",
     suggestedSounds: ["Fogo baixo crepitando", "Vento gelado", "Dentes batendo", "Silêncio noturno"],
     suggestedWeather: ["Noite estrelada", "Temperatura abaixo de zero"],
     suggestedActions: ["Alimentando fogo", "Encolhendo-se", "Massageando extremidades"],
     icon: "❄️"
   },
 
   // === RUÍNAS & CIDADES ===
   {
     id: "ruins-abandoned-city",
     name: "Cidade Abandonada",
     description: "Explorando ruas de cidade deserta",
     category: "ruins",
     environment: "Rua de cidade abandonada, prédios deteriorados, vegetação invadindo, carros enferrujados",
     details: "Janelas quebradas, grafites desbotados, lixo antigo, silêncio opressivo",
     suggestedSounds: ["Vento em construções", "Metal rangendo", "Vidro sob os pés", "Eco de passos"],
     suggestedWeather: ["Céu nublado", "Luz cinzenta"],
     suggestedActions: ["Vasculhando prédios", "Evitando escombros", "Coletando suprimentos"],
     icon: "🏚️"
   },
   {
     id: "ruins-supermarket",
     name: "Supermercado Saqueado",
     description: "Buscando suprimentos em mercado abandonado",
     category: "ruins",
     environment: "Interior de supermercado destruído, prateleiras tombadas, produtos espalhados",
     details: "Embalagens rasgadas, latas amassadas, mofo em perecíveis, luz entrando por buracos no teto",
     suggestedSounds: ["Passos em vidro quebrado", "Latas rolando", "Eco metálico", "Goteiras"],
     suggestedWeather: ["Interior escuro", "Feixes de luz"],
     suggestedActions: ["Vasculhando prateleiras", "Verificando datas", "Enchendo mochila"],
     icon: "🛒"
   },
   {
     id: "ruins-hospital",
     name: "Hospital Abandonado",
     description: "Buscando suprimentos médicos em hospital",
     category: "ruins",
     environment: "Corredor de hospital abandonado, macas tombadas, equipamentos destruídos",
     details: "Azulejos quebrados, documentos espalhados, seringas no chão, escuridão parcial",
     suggestedSounds: ["Eco intenso", "Portas rangendo", "Gotejamento", "Passos cautelosos"],
     suggestedWeather: ["Interior escuro", "Luz de lanterna"],
     suggestedActions: ["Procurando medicamentos", "Abrindo armários", "Iluminando com lanterna"],
     icon: "🏥"
   },
 
   // === NATUREZA SELVAGEM ===
   {
     id: "nature-waterfall",
     name: "Cachoeira Escondida",
     description: "Descobrindo cachoeira em meio à floresta",
     category: "nature",
     environment: "Cachoeira de médio porte em área isolada, piscina natural, vegetação exuberante",
     details: "Spray de água, arco-íris na névoa, rochas cobertas de musgo, peixes na piscina",
     suggestedSounds: ["Água caindo", "Spray constante", "Pássaros tropicais", "Água corrente"],
     suggestedWeather: ["Sol entre nuvens", "Umidade alta"],
     suggestedActions: ["Enchendo recipientes", "Lavando-se", "Descansando nas rochas"],
     icon: "💦"
   },
   {
     id: "nature-dense-jungle",
     name: "Selva Densa",
     description: "Atravessando vegetação tropical fechada",
     category: "nature",
     environment: "Interior de selva tropical, vegetação fechada, pouca luz no solo",
     details: "Cipós pendurados, folhas gigantes, insetos em todo lugar, umidade extrema",
     suggestedSounds: ["Insetos tropicais", "Gotas caindo de folhas", "Pássaros exóticos", "Galhos quebrando"],
     suggestedWeather: ["Sombra da copa", "Calor úmido"],
     suggestedActions: ["Cortando caminho com facão", "Desviando de cipós", "Espantando insetos"],
     icon: "🌴"
   },
   {
     id: "nature-open-meadow",
     name: "Clareira Aberta",
     description: "Cruzando campo aberto com gramíneas altas",
     category: "nature",
     environment: "Campo aberto com gramíneas altas, flores silvestres, céu amplo",
     details: "Grama ondulando com o vento, borboletas, sol direto, horizonte visível",
     suggestedSounds: ["Vento na grama", "Abelhas", "Grilos", "Silêncio do campo"],
     suggestedWeather: ["Dia ensolarado", "Brisa suave"],
     suggestedActions: ["Atravessando agachado", "Observando horizonte", "Descansando no sol"],
     icon: "🌾"
   },
   {
     id: "nature-night-forest",
     name: "Floresta Noturna",
     description: "Navegando pela floresta à noite",
     category: "nature",
     environment: "Floresta densa à noite, apenas luz da lua filtrando, sombras em movimento",
     details: "Olhos brilhando na escuridão, galhos como silhuetas, lua cheia entre nuvens",
     suggestedSounds: ["Corujas", "Galhos estalando", "Animais noturnos", "Vento nas folhas"],
     suggestedWeather: ["Noite de lua cheia", "Céu parcialmente nublado"],
     suggestedActions: ["Caminhando com cautela", "Parando para ouvir", "Usando lanterna minimamente"],
     icon: "🌙"
   },
 ];
 
 // Templates de séries pré-configuradas
 export const seriesTemplates = [
   {
     id: "first-days",
     title: "Os Primeiros Dias",
     description: "Os primeiros momentos após o colapso - sobrevivência básica",
     icon: "📅",
     color: "from-amber-500 to-red-600",
     suggestedEpisodes: [
       { title: "Despertar", scenario: "ruins-abandoned-city", description: "Acordando em um mundo vazio" },
       { title: "Primeiro Abrigo", scenario: "shelter-cave", description: "Encontrando refúgio temporário" },
       { title: "Busca por Água", scenario: "survival-water-collect", description: "A primeira necessidade" },
       { title: "A Primeira Noite", scenario: "survival-campfire", description: "Sobrevivendo ao escuro" },
     ]
   },
   {
     id: "search-for-life",
     title: "Em Busca de Vida",
     description: "Jornada em busca de outros sobreviventes",
     icon: "🔍",
     color: "from-emerald-500 to-teal-600",
     suggestedEpisodes: [
       { title: "Sinais de Vida", scenario: "explore-forest-path", description: "Seguindo pistas" },
       { title: "A Cidade Morta", scenario: "ruins-abandoned-city", description: "Explorando ruínas urbanas" },
       { title: "O Hospital", scenario: "ruins-hospital", description: "Buscando suprimentos médicos" },
       { title: "Rastros", scenario: "explore-riverbank", description: "Seguindo um rio" },
     ]
   },
   {
     id: "winter-survival",
     title: "Sobrevivendo ao Inverno",
     description: "Enfrentando o frio extremo",
     icon: "❄️",
     color: "from-blue-500 to-cyan-600",
     suggestedEpisodes: [
       { title: "O Frio Chega", scenario: "weather-cold-night", description: "Primeiros sinais do inverno" },
       { title: "Abrigo Permanente", scenario: "shelter-abandoned-cabin", description: "Encontrando uma cabana" },
       { title: "Estoques", scenario: "ruins-supermarket", description: "Preparando suprimentos" },
       { title: "Tempestade", scenario: "weather-thunderstorm", description: "Enfrentando o pior" },
     ]
   },
   {
     id: "nature-reclaims",
     title: "A Natureza Reclama",
     description: "O mundo natural retomando o controle",
     icon: "🌿",
     color: "from-green-500 to-emerald-600",
     suggestedEpisodes: [
       { title: "Floresta Desperta", scenario: "nature-dense-jungle", description: "Vegetação invadindo" },
       { title: "O Oásis", scenario: "nature-waterfall", description: "Descobrindo beleza natural" },
       { title: "Névoa da Manhã", scenario: "weather-morning-mist", description: "Paz momentânea" },
       { title: "Noite Selvagem", scenario: "nature-night-forest", description: "Os sons da floresta" },
     ]
   },
 ];
 
 // Personagem padrão otimizado para consistência
 export const survivorCharacterTemplate = {
   id: "the-survivor",
   name: "O Sobrevivente",
   description: "Personagem principal otimizado para consistência visual em vídeos de 8 segundos",
   category: "Pós-Apocalíptico" as const,
   basePrompt: `Homem solitário, 35-40 anos, barba de vários dias, cabelos castanho-escuros bagunçados. Rosto marcado pelo sol e cansaço, olhos castanhos determinados, cicatriz pequena na sobrancelha esquerda. Veste jaqueta militar verde-oliva desgastada sobre camisa cinza, calças cargo marrons com bolsos cheios, botas de couro surradas. Mochila tática nas costas, faca de caça no cinto. Expressão sempre séria e vigilante, movimentos cautelosos e silenciosos. Pele bronzeada pelo sol, mãos calejadas. [THE LAST HUMAN SURVIVOR]`,
   tags: ["sobrevivência", "pós-apocalíptico", "solitário", "consistente"],
   isCustom: false,
   visualStyle: "Estilo cinematográfico pós-apocalíptico, tons dessaturados, atmosfera 'The Last of Us'",
   aspectRatio: "16:9",
   cameraWork: "Planos médios e closes, câmera seguindo o personagem, movimentos lentos e deliberados",
 };