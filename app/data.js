export const site = {
  name: "Lana Baby Lab",
  url: "http://localhost:3004",
  description:
    "Receitas suaves, rotina leve e um cantinho carinhoso para famílias em fase de introdução alimentar."
};

export const recipeThemes = [
  { value: "peach", label: "Pêssego suave" },
  { value: "banana", label: "Banana alegre" },
  { value: "green", label: "Verde macio" },
  { value: "berry", label: "Rosa delicado" },
  { value: "sky", label: "Azul clarinho" },
  { value: "sun", label: "Amarelo solar" }
];

export const studioTemplate = {
  title: "Purê cremoso de cenoura e batata",
  age: "8+ meses",
  excerpt: "Uma combinação suave e aconchegante para almoço ou jantar.",
  intro:
    "Receita delicada, fácil de preparar e pensada para bebês que estão ampliando os sabores no dia a dia.",
  theme: "peach",
  emoji: "🥕",
  prepTime: "20 min",
  yield: "2 porções pequenas",
  texture: "Cremosa e macia",
  ingredients: [
    "1 cenoura média cozida",
    "1 batata pequena cozida",
    "1 colher de chá de azeite",
    "Água do cozimento para ajustar a textura"
  ],
  steps: [
    "Cozinhe os legumes até ficarem bem macios.",
    "Amasse ou processe rapidamente até obter um creme suave.",
    "Finalize com azeite e ajuste a textura se necessário."
  ],
  tip:
    "Sirva morno e ofereça aos poucos, respeitando o ritmo do bebê durante a refeição.",
  serving:
    "Se o bebê já estiver avançando na textura, deixe pequenos pedacinhos para enriquecer a experiência."
};

export const recipes = {
  abobora: {
    slug: "pure-abobora-frango",
    age: "6+ meses",
    ageKey: "6",
    title: "Purê de abóbora com frango desfiado",
    excerpt: "Cremoso, delicado e rico em sabor, ideal para um almoço leve.",
    keywords: "abobora frango pure almoco cremoso",
    theme: "peach",
    art: "pumpkin",
    emoji: "🎃",
    intro:
      "Um almoço macio, nutritivo e acolhedor para bebês em fase inicial de introdução alimentar.",
    meta: [
      ["Tempo", "25 min"],
      ["Rendimento", "2 porções pequenas"],
      ["Textura", "Cremosa e lisa"]
    ],
    ingredients: [
      "1 xícara de abóbora cabotiá em cubos",
      "3 colheres de sopa de frango cozido e desfiado",
      "1 colher de chá de azeite",
      "Água do cozimento, se precisar ajustar a textura"
    ],
    steps: [
      "Cozinhe a abóbora até ficar bem macia.",
      "Amasse com garfo ou bata rapidamente para um creme suave.",
      "Misture o frango desfiado bem miúdo.",
      "Finalize com azeite e ajuste com um pouco da água do cozimento."
    ],
    tip:
      "Sirva morno e observe a resposta do bebê à nova combinação de proteína com legume adocicado.",
    serving:
      "Para bebês no início, prefira textura mais lisa. Em fases seguintes, deixe pequenos pedacinhos para ampliar a experiência sensorial."
  },
  mingau: {
    slug: "mingau-banana-aveia",
    age: "8+ meses",
    ageKey: "8",
    title: "Mingau de aveia com banana",
    excerpt: "Uma opção aconchegante para café da manhã ou lanche da tarde.",
    keywords: "banana aveia mingau cafe manha lanche",
    theme: "banana",
    art: "banana",
    emoji: "🍌",
    intro:
      "Uma opção aconchegante para café da manhã ou lanche da tarde, com sabor naturalmente docinho.",
    meta: [
      ["Tempo", "10 min"],
      ["Rendimento", "1 porção"],
      ["Textura", "Macio e cremoso"]
    ],
    ingredients: [
      "1 banana madura pequena",
      "2 colheres de sopa de aveia fina",
      "120 ml de água ou leite orientado pelo pediatra"
    ],
    steps: [
      "Leve a aveia com o líquido ao fogo baixo, mexendo sempre.",
      "Quando engrossar, desligue e misture a banana amassada.",
      "Espere amornar antes de servir."
    ],
    tip:
      "Se quiser variar, use pera madura amassada em vez de banana em dias alternados.",
    serving: "Sirva em colher pequena, observando a temperatura e a consistência."
  },
  bolinho: {
    slug: "bolinho-brocolis-batata",
    age: "9+ meses",
    ageKey: "9",
    title: "Bolinho assado de brócolis e batata",
    excerpt:
      "Fácil de segurar com as mãozinhas e ótimo para incentivar autonomia.",
    keywords: "brocolis batata bolinho assado autonomia lanche",
    theme: "green",
    art: "broccoli",
    emoji: "🥦",
    intro:
      "Prático para mãozinhas curiosas e ótimo para estimular autonomia na hora da refeição.",
    meta: [
      ["Tempo", "30 min"],
      ["Rendimento", "6 bolinhos"],
      ["Textura", "Macia por dentro"]
    ],
    ingredients: [
      "1 batata média cozida e amassada",
      "1/2 xícara de brócolis cozido e picado",
      "1 colher de sopa de aveia fina"
    ],
    steps: [
      "Misture a batata, o brócolis e a aveia até formar uma massa.",
      "Modele pequenos bolinhos com as mãos.",
      "Asse em forno médio até firmar levemente."
    ],
    tip:
      "Faça bolinhos menores para facilitar a pega palmar e evitar pedaços grandes demais.",
    serving:
      "Sirva morno e sempre acompanhe o bebê enquanto ele explora o alimento."
  },
  pera: {
    slug: "creminho-pera-ameixa",
    age: "6+ meses",
    ageKey: "6",
    title: "Creminho de pera com ameixa",
    excerpt: "Doçura natural e textura macia para um lanchinho delicado.",
    keywords: "pera ameixa creme frutas digestao lanche",
    theme: "berry",
    art: "pear",
    emoji: "🍐",
    intro: "Uma combinação suave e naturalmente adocicada para um lanche leve.",
    meta: [
      ["Tempo", "12 min"],
      ["Rendimento", "1 porção"],
      ["Textura", "Lisa e delicada"]
    ],
    ingredients: [
      "1 pera madura",
      "1 ameixa seca sem caroço, hidratada",
      "Um pouco de água filtrada"
    ],
    steps: [
      "Cozinhe a pera no vapor até ficar macia.",
      "Bata ou amasse com a ameixa hidratada.",
      "Se necessário, adicione algumas gotas de água para suavizar."
    ],
    tip:
      "Essa combinação costuma ser lembrada em rotinas que pedem frutas mais macias e hidratantes.",
    serving: "Sirva fresco ou levemente morno, em pequenas colheradas."
  },
  lentilha: {
    slug: "papinha-arroz-lentilha",
    age: "8+ meses",
    ageKey: "8",
    title: "Papinha de arroz com lentilha",
    excerpt: "Uma combinação nutritiva e suave para variar o cardápio do bebê.",
    keywords: "arroz lentilha papinha jantar salgado nutritivo",
    theme: "sky",
    art: "rice",
    emoji: "🍚",
    intro:
      "Uma mistura suave e nutritiva para variar os almoços e jantares do bebê.",
    meta: [
      ["Tempo", "28 min"],
      ["Rendimento", "2 porções pequenas"],
      ["Textura", "Amassadinha"]
    ],
    ingredients: [
      "2 colheres de sopa de arroz",
      "2 colheres de sopa de lentilha",
      "Legumes cozidos de sua preferência",
      "Água suficiente para cozinhar"
    ],
    steps: [
      "Cozinhe o arroz e a lentilha até ficarem bem macios.",
      "Junte os legumes cozidos.",
      "Amasse tudo com garfo ou processe rapidamente."
    ],
    tip:
      "Cenoura, abobrinha e chuchu costumam funcionar bem nessa base porque mantêm a receita delicada.",
    serving:
      "Ajuste a textura com a água do cozimento para deixá-la mais fluida ou mais encorpada."
  },
  panqueca: {
    slug: "panqueca-banana-aveia",
    age: "9+ meses",
    ageKey: "9",
    title: "Panquequinha de banana e aveia",
    excerpt:
      "Fofinha, prática e perfeita para bebês que estão pegando alimentos.",
    keywords: "panquequinha banana aveia dedo food cafe manha",
    theme: "sun",
    art: "pancake",
    emoji: "🥞",
    intro:
      "Fofinha, prática e ótima para bebês que estão começando a pegar os alimentos com as mãos.",
    meta: [
      ["Tempo", "15 min"],
      ["Rendimento", "4 mini panquecas"],
      ["Textura", "Macia e fácil de segurar"]
    ],
    ingredients: [
      "1 banana madura",
      "3 colheres de sopa de aveia",
      "1 ovo pequeno, se já introduzido com segurança"
    ],
    steps: [
      "Amasse a banana e misture com aveia e ovo.",
      "Coloque pequenas porções em frigideira antiaderente.",
      "Doure dos dois lados em fogo baixo."
    ],
    tip:
      "Corte em tirinhas ou pedaços pequenos para facilitar a autonomia, sempre com supervisão.",
    serving: "Espere amornar e teste a textura com os dedos antes de oferecer."
  }
};

export const recipeList = Object.values(recipes);

export const categories = {
  "6": {
    slug: "6-meses",
    label: "6+ meses",
    title: "Primeiras colheradas com texturas acolhedoras",
    description:
      "Uma seleção suave para o começo da introdução alimentar, com foco em cremes e frutas macias.",
    theme: "peach",
    items: ["abobora", "pera"]
  },
  "8": {
    slug: "8-meses",
    label: "8+ meses",
    title: "Receitas mais encorpadas para novas descobertas",
    description:
      "Uma fase ótima para ampliar sabores e combinar cereais, frutas e leguminosas de forma leve.",
    theme: "banana",
    items: ["mingau", "lentilha"]
  },
  "9": {
    slug: "9-meses",
    label: "9+ meses",
    title: "Mais autonomia e texturas para explorar com as mãos",
    description:
      "Aqui entram opções pensadas para bebês mais curiosos, com formatos fáceis de pegar e explorar.",
    theme: "green",
    items: ["bolinho", "panqueca"]
  }
};

export const recipeBySlug = Object.fromEntries(
  recipeList.map((recipe) => [recipe.slug, recipe])
);

export const recipeKeyBySlug = Object.fromEntries(
  Object.entries(recipes).map(([key, recipe]) => [recipe.slug, key])
);

export const categoryBySlug = Object.fromEntries(
  Object.values(categories).map((category) => [category.slug, category])
);

export const categoryKeyBySlug = Object.fromEntries(
  Object.entries(categories).map(([key, category]) => [category.slug, key])
);
