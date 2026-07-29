// Innera — conteúdo estático da interface.
// Nenhum dado financeiro aqui: tudo (saldo, categorias, transações, lotes,
// artigos…) vem do Supabase via CRUD (ver api.js / store.jsx).

// Links externos oficiais
export const LINKS = {
  leiloes: 'https://globalequityleiloes.com/home',
  instagram: 'https://www.instagram.com/paulaleiloeira?igsh=MTJreXhscnpwOHo1ag%3D%3D&utm_source=qr',
  blog: 'https://paullaleiloeira.com/',
  podcast: 'https://www.youtube.com/playlist?list=PLnrgsxAp5AfM4TtVgWwXuwoCqHI2cG1WO',
}
export const openExternal = url => window.open(url, '_blank', 'noopener,noreferrer')

// Filtros da tela de leilões (rótulos fixos de UI)
export const lotCats = ['Todos', 'Imóveis', 'Veículos', 'Eletrônicos', 'Joias', 'Máquinas']

// Atalhos da tela "Aprender" (rótulo, ícone lucide)
export const quickLinks = [
  ['Trilhas', 'GraduationCap'], ['Artigos', 'FileText'], ['Vídeos', 'Play'],
  ['Podcasts', 'Mic'], ['Favoritos', 'Star'],
]

// Categorias padrão criadas para cada novo usuário no primeiro acesso
export const DEFAULT_CATS = [
  { nome: 'Moradia',              emoji: '🏠',       posicao: 0, em_transacoes: true },
  { nome: 'Alimentação',          emoji: '🥗',       posicao: 1, em_transacoes: true },
  { nome: 'Transporte',           emoji: '🚌',       posicao: 2, em_transacoes: true },
  { nome: 'Lazer',                emoji: '🌸',       posicao: 3, em_transacoes: true },
  { nome: 'Beleza & Autocuidado', emoji: '💆🏻‍♀️',    posicao: 4, em_transacoes: true },
  { nome: 'Reserva',              emoji: '🪺',       posicao: 5, em_transacoes: false },
  { nome: 'Investir em Leilões',  emoji: '🏛️',       posicao: 6, em_transacoes: false },
]
