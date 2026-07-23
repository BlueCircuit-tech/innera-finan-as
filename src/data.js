// Innera — dados mockados (nenhuma transação é real)

export const user = { nome: 'Paula', email: 'paula@email.com' }

export const initialCats = [
  { id: 'moradia',  nome: 'Moradia',              ico: '🏠', plan: 1800, gasto: 1800,  em_transacoes: true },
  { id: 'alimento', nome: 'Alimentação',          ico: '🥗', plan: 1200, gasto: 986.4, em_transacoes: true },
  { id: 'transp',   nome: 'Transporte',           ico: '🚌', plan: 500,  gasto: 342.9, em_transacoes: true },
  { id: 'lazer',    nome: 'Lazer',                ico: '🌸', plan: 400,  gasto: 431.2, em_transacoes: true },
  { id: 'cuidado',  nome: 'Beleza & Autocuidado', ico: '💆🏻‍♀️', plan: 300, gasto: 185,  em_transacoes: true },
  { id: 'poupanca', nome: 'Reserva',              ico: '🪺', plan: 800,  gasto: 800,   em_transacoes: false },
  { id: 'leiloes',  nome: 'Investir em Leilões',  ico: '🏛️', plan: 600,  gasto: 0,     em_transacoes: false },
]

export const initialTxs = [
  { tipo: 'out', val: 86.4, cat: 'alimento', desc: 'Mercado da semana',      data: '16 jul' },
  { tipo: 'out', val: 54.9, cat: 'lazer',    desc: 'Cinema com as amigas',   data: '14 jul' },
  { tipo: 'in',  val: 450,  cat: 'renda',    desc: 'Freela de design',       data: '12 jul' },
  { tipo: 'out', val: 120,  cat: 'cuidado',  desc: 'Salão — corte e escova', data: '10 jul' },
  { tipo: 'out', val: 38.5, cat: 'transp',   desc: 'Recarga do cartão',      data: '09 jul' },
]

export const sobras = [['Fev', 320], ['Mar', 450], ['Abr', 380], ['Mai', 610], ['Jun', 720], ['Jul', 830]]

export const renda = 6500
export const saldoInicial = 4230.45

export const lotCats = ['Todos', 'Imóveis', 'Veículos', 'Eletrônicos', 'Joias', 'Máquinas']

export const initialLots = [
  {
    id: 1, cat: 'Imóveis', ico: '🏢', ph: 'ph-a', reco: true,
    nome: 'Apartamento 2 dorms — Centro, Curitiba/PR',
    specs: '64m² · 2 dormitórios · 1 vaga · Sala ampla',
    status: 'Ocupado · Venda direta · Ótima oportunidade',
    desc: 'Apto de 64m² com 2 dormitórios, sala ampla e 1 vaga. Ocupado, venda direta. Ótima oportunidade abaixo da avaliação.',
    aval: 225000, lance: 148000, inc: 2000, fim: '2d 14h', bids: 12,
    rentab: '32%', risco: 'Baixo', revenda: '60 a 90 dias',
    ia: 'Excelente oportunidade para primeira compra. Alta demanda para locação e revenda.',
    fotos: ['🏢', '🛋️', '🍳'],
    docs: ['Edital do leilão (PDF)', 'Matrícula do imóvel', 'Laudo de avaliação', 'Certidões negativas'],
  },
  {
    id: 2, cat: 'Veículos', ico: '🚙', ph: 'ph-b',
    nome: 'Honda HR-V EXL 1.8 — 2021, 42.000 km',
    specs: '42.000 km · Automático · Flex',
    status: 'Revisões em dia · Único dono',
    desc: 'SUV automático, único dono, revisões em dia e documentação pronta para transferência. Ótimo estado de conservação.',
    aval: 96000, lance: 72500, inc: 500, fim: '8h 20min', bids: 27,
    rentab: '18%', risco: 'Baixo', revenda: '30 a 60 dias',
    ia: 'Modelo com alta liquidez e depreciação lenta. Boa margem para revenda rápida.',
    fotos: ['🚙', '🪑', '⚙️'],
    docs: ['Edital do leilão (PDF)', 'Laudo cautelar', 'Débitos e multas (zerado)'],
  },
  {
    id: 3, cat: 'Imóveis', ico: '🏡', ph: 'ph-c',
    nome: 'Casa 3 dorms com quintal — Londrina/PR',
    specs: '120m² · 3 dormitórios · Terreno 300m²',
    status: 'Desocupada · Aceita financiamento em até 30x',
    desc: 'Casa térrea de 120m² em terreno de 300m². Desocupada, aceita financiamento do arremate em até 30x.',
    aval: 390000, lance: 212000, inc: 3000, fim: '5d 02h', bids: 6,
    rentab: '38%', risco: 'Médio', revenda: '90 a 120 dias',
    ia: 'Grande potencial de valorização no bairro. Ideal para reforma e revenda.',
    fotos: ['🏡', '🌳', '🛁'],
    docs: ['Edital do leilão (PDF)', 'Matrícula do imóvel', 'Laudo de avaliação'],
  },
  {
    id: 4, cat: 'Joias', ico: '💍', ph: 'ph-d',
    nome: 'Lote de joias em ouro 18k — 92g',
    specs: '92g · Ouro 18k · Anéis, correntes e brincos',
    status: 'Com certificado de autenticidade',
    desc: 'Conjunto com anéis, correntes e brincos em ouro 18k, com certificado de autenticidade e nota de avaliação.',
    aval: 32000, lance: 18400, inc: 200, fim: '1d 06h', bids: 19,
    rentab: '22%', risco: 'Baixo', revenda: '15 a 45 dias',
    ia: 'Ouro preserva valor e tem revenda ágil. Boa opção de entrada em patrimônio.',
    fotos: ['💍', '📿', '👂'],
    docs: ['Edital do leilão (PDF)', 'Certificado de autenticidade'],
  },
  {
    id: 5, cat: 'Eletrônicos', ico: '💻', ph: 'ph-e',
    nome: 'Lote 12 notebooks corporativos i7',
    specs: '12 unidades · i7 11ª ger. · 16GB · SSD 512GB',
    status: 'Frota corporativa renovada · Funcionando',
    desc: 'Notebooks Dell Latitude i7 11ª geração, 16GB RAM, SSD 512GB. Frota corporativa renovada, funcionando.',
    aval: 42000, lance: 19800, inc: 300, fim: '3d 09h', bids: 15,
    rentab: '28%', risco: 'Médio', revenda: '30 a 60 dias',
    ia: 'Revenda unitária aumenta a margem. Demanda alta no mercado de usados.',
    fotos: ['💻', '🖥️', '🔌'],
    docs: ['Edital do leilão (PDF)', 'Nota fiscal de origem'],
  },
  {
    id: 6, cat: 'Veículos', ico: '🛵', ph: 'ph-c',
    nome: 'Honda PCX 160 — 2023, 8.500 km',
    specs: '8.500 km · Automática · Flex',
    status: 'IPVA pago · Sem restrições',
    desc: 'Scooter econômica, ideal para o dia a dia. IPVA pago, sem restrições, pequenos riscos de uso.',
    aval: 16500, lance: 9200, inc: 150, fim: '12h 45min', bids: 9,
    rentab: '20%', risco: 'Baixo', revenda: '15 a 45 dias',
    ia: 'Scooter econômica e muito procurada. Giro rápido de revenda.',
    fotos: ['🛵', '🪖', '🔧'],
    docs: ['Edital do leilão (PDF)', 'Laudo cautelar'],
  },
]

export const initialMyBids = [
  { lot: 2, meu: 72500, status: 'vencendo' },
  { lot: 4, meu: 18200, status: 'superada' },
]

export const initialFavs = [1, 6]

export const bidHistory = {
  2: [['Você', '72.500', true], ['M. Fernandes', '72.000'], ['Você', '71.500', true], ['J. Prado', '71.000']],
  1: [['A. Ribeiro', '148.000'], ['C. Souza', '146.000'], ['A. Ribeiro', '144.000']],
  4: [['R. Lima', '18.400'], ['Você', '18.200', true], ['P. Alves', '18.000']],
}

export const metodoInnera = [
  ['Organize cada real', 'Dê um destino para cada real que entra no mês.'],
  ['Crie sua reserva', 'Construa a tranquilidade que abre espaço para investir.'],
  ['Invista com inteligência', 'Faça sua sobra render com estratégia e propósito.'],
  ['Compre patrimônio', 'Use os leilões para comprar abaixo do valor de mercado.'],
  ['Multiplique sua liberdade', 'Transforme patrimônio em liberdade financeira.'],
]

export const quickLinks = [
  ['Trilhas', 'GraduationCap'], ['Artigos', 'FileText'], ['Vídeos', 'Play'],
  ['Podcasts', 'Mic'], ['Favoritos', 'Star'],
]

export const tracks = [
  {
    titulo: 'Do orçamento ao primeiro lance: sua jornada de patrimônio',
    subtitulo: '4 aulas curtas sobre organizar o mês, criar sobra e participar do primeiro leilão com segurança.',
    emoji: '💡', total_aulas: 4, aula_atual: 1, progresso: 0, destaque: true,
  },
  {
    titulo: 'Organização financeira',
    subtitulo: 'Aula 2 — Como criar sua reserva e ter tranquilidade',
    emoji: '📓', total_aulas: 4, aula_atual: 2, progresso: 60, destaque: false,
  },
]

export const articles = [
  {
    ico: '🏦', tag: 'Reserva', tempo: '5 min de leitura',
    titulo: 'Reserva estratégica: por que ela é o primeiro passo para investir',
    corpo: `<h1>Reserva estratégica: o primeiro passo</h1><div class="meta">Reserva · 5 min de leitura</div>
    <p>Antes de qualquer investimento vem a reserva. Ela é o colchão que te dá tranquilidade para investir sem medo — e para não precisar sacar no pior momento.</p>
    <h3>1. Quanto guardar</h3><p>Comece mirando de 3 a 6 meses dos seus gastos essenciais. Parece muito? Constância é o que importa: um pouco todo mês já muda o jogo.</p>
    <h3>2. Onde deixar</h3><p>A reserva precisa de liquidez e segurança — nada de deixá-la exposta a risco. É dinheiro para dormir tranquila, não para arriscar.</p>
    <h3>3. Só então, invista</h3><p>Com a reserva formada, sua sobra mensal fica livre para construir patrimônio — inclusive nos leilões, comprando abaixo do valor de mercado.</p>`,
  },
  {
    ico: '⚠️', tag: 'Orçamento', tempo: '5 min de leitura',
    titulo: '5 erros que impedem você de fazer dinheiro sobrar no mês',
    corpo: `<h1>5 erros que impedem a sobra</h1><div class="meta">Orçamento · 5 min de leitura</div>
    <p>Sobrar dinheiro no fim do mês raramente é sorte — é método. Veja os cinco erros mais comuns que sabotam a sua sobra.</p>
    <h3>1. Olhar só para o saldo da conta</h3><p>O saldo não sabe que a fatura vence semana que vem. Gaste olhando para a categoria, não para o extrato.</p>
    <h3>2. Não dar destino a cada real</h3><p>Dinheiro sem destino evapora. Distribua tudo — inclusive a sobra — assim que o salário cai.</p>
    <h3>3. Tratar a sobra como sobra</h3><p>Sobra planejada vira patrimônio. Trate-a como uma conta a pagar para o seu futuro, antes do lazer.</p>
    <h3>4. Ignorar os pequenos gastos</h3><p>Os "só R$ 20" somados são o que estoura o mês. Registre tudo — o app faz isso em segundos.</p>
    <h3>5. Desistir no primeiro deslize</h3><p>Furou o orçamento? Todo mês é um recomeço. Consistência vence perfeição.</p>`,
  },
  {
    ico: '🏛️', tag: 'Leilões', tempo: '7 min de leitura',
    titulo: 'Entenda os leilões e compre abaixo do valor de mercado',
    corpo: `<h1>Entenda os leilões</h1><div class="meta">Leilões · 7 min de leitura</div>
    <p>Leilão não é cassino — é compra planejada com desconto. O segredo está em três etapas que acontecem <b>antes</b> do primeiro lance.</p>
    <h3>1. Leia o edital inteiro</h3><p>O edital diz se o imóvel está ocupado, quem paga dívidas anteriores e como funciona o pagamento. No Innera, a documentação de cada lote fica na tela de detalhes.</p>
    <h3>2. Defina seu teto e não passe dele</h3><p>Calcule custos extras (comissão do leiloeiro, ITBI, reformas) e defina o valor máximo do lance com base na sua sobra acumulada — nunca no calor da disputa.</p>
    <h3>3. Comece pequeno</h3><p>Lotes de menor valor, como veículos e eletrônicos, são ótimos para aprender a dinâmica antes de partir para um imóvel.</p>`,
  },
  {
    ico: '🪷', tag: 'Método', tempo: '6 min de leitura',
    titulo: 'Dê um trabalho para cada real: o método que muda tudo',
    corpo: `<h1>Dê um trabalho para cada real</h1><div class="meta">Método Innera · 6 min de leitura</div>
    <p>A maioria de nós aprendeu a perguntar "quanto sobrou?" no fim do mês. O método Innera inverte a pergunta: <b>o que cada real vai fazer por você este mês?</b></p>
    <h3>1. Todo real tem um destino</h3><p>Quando o salário cai, você distribui tudo entre as categorias: moradia, alimentação, lazer, reserva… e também a sua sobra para investir.</p>
    <h3>2. Gaste olhando para a categoria</h3><p>O saldo da conta mente: ele não sabe que o aluguel vence semana que vem. A categoria sabe.</p>
    <h3>3. A sobra é uma categoria</h3><p>Sobra planejada vira patrimônio. No Innera, ela tem tela própria e uma ponte direta para os leilões.</p>`,
  },
]
