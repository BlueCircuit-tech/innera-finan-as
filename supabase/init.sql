-- ============================================================================
-- INNERA — Finanças & Leilões · Supabase (schema + storage + RLS + seed)
-- ----------------------------------------------------------------------------
-- Cole no SQL Editor do Supabase e clique em RUN. É idempotente (pode rodar
-- de novo). Dados 100% fictícios (protótipo). Os emojis servem de placeholder
-- até as imagens serem enviadas — cada entidade tem `emoji` + `*_url` (imagem).
-- No app, mostre a imagem se `*_url` existir; senão, caia no emoji.
-- ============================================================================

create extension if not exists pgcrypto;

-- ============================ 1. TABELAS ====================================

create table if not exists public.profiles (
  id           uuid primary key default gen_random_uuid(),
  nome         text not null,
  email        text unique,
  avatar_url   text,
  avatar_emoji text default '👩🏻',
  renda        numeric(12,2) not null default 0,
  saldo        numeric(12,2) not null default 0,
  created_at   timestamptz not null default now()
);

create table if not exists public.categories (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references public.profiles(id) on delete cascade,
  nome          text not null,
  emoji         text,
  image_url     text,
  planejado     numeric(12,2) not null default 0,
  gasto         numeric(12,2) not null default 0,
  posicao       int not null default 0,
  em_transacoes boolean not null default true,   -- aparece no seletor de despesa
  created_at    timestamptz not null default now()
);

create table if not exists public.transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles(id) on delete cascade,
  tipo        text not null check (tipo in ('in','out')),
  valor       numeric(12,2) not null check (valor > 0),
  category_id uuid references public.categories(id) on delete set null,
  descricao   text,
  data        date not null default current_date,
  created_at  timestamptz not null default now()
);

create table if not exists public.lots (
  id            bigint generated always as identity primary key,
  categoria     text not null check (categoria in ('Imóveis','Veículos','Eletrônicos','Joias','Máquinas')),
  emoji         text,
  image_url     text,                 -- capa (upload)
  nome          text not null,
  specs         text,
  status        text,
  descricao     text,
  valor_mercado numeric(14,2) not null,
  preco_atual   numeric(14,2) not null,
  incremento    numeric(12,2) not null default 100,
  ends_at       timestamptz not null,
  lances        int not null default 0,
  rentabilidade text,
  risco         text check (risco in ('Baixo','Médio','Alto')),
  revenda       text,
  analise_ia    text,
  recomendado   boolean not null default false,
  desconto      int generated always as ((round((1 - preco_atual / nullif(valor_mercado,0)) * 100))::int) stored,
  created_at    timestamptz not null default now()
);

create table if not exists public.lot_photos (
  id        uuid primary key default gen_random_uuid(),
  lot_id    bigint references public.lots(id) on delete cascade,
  emoji     text,
  image_url text,
  posicao   int not null default 0
);

create table if not exists public.lot_documents (
  id       uuid primary key default gen_random_uuid(),
  lot_id   bigint references public.lots(id) on delete cascade,
  nome     text not null,
  file_url text,
  posicao  int not null default 0
);

create table if not exists public.lot_bids (
  id          uuid primary key default gen_random_uuid(),
  lot_id      bigint references public.lots(id) on delete cascade,
  user_id     uuid references public.profiles(id) on delete set null,
  bidder_name text not null,
  valor       numeric(14,2) not null,
  is_me       boolean not null default false,
  created_at  timestamptz not null default now()
);

create table if not exists public.favorites (
  user_id    uuid references public.profiles(id) on delete cascade,
  lot_id     bigint references public.lots(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, lot_id)
);

create table if not exists public.articles (
  id            uuid primary key default gen_random_uuid(),
  tag           text,
  emoji         text,
  cover_url     text,
  titulo        text not null,
  tempo_leitura text,
  corpo_html    text,
  posicao       int not null default 0,
  publicado     boolean not null default true,
  created_at    timestamptz not null default now()
);

create table if not exists public.methodology_steps (
  id        uuid primary key default gen_random_uuid(),
  passo     int not null,
  titulo    text not null,
  descricao text
);

create table if not exists public.learning_tracks (
  id          uuid primary key default gen_random_uuid(),
  titulo      text not null,
  subtitulo   text,
  emoji       text,
  cover_url   text,
  total_aulas int default 0,
  aula_atual  int default 0,
  progresso   int default 0,           -- 0..100
  destaque    boolean not null default false,
  posicao     int not null default 0
);

-- índices úteis
create index if not exists idx_tx_user_data     on public.transactions(user_id, data desc);
create index if not exists idx_cat_user         on public.categories(user_id, posicao);
create index if not exists idx_lots_categoria   on public.lots(categoria);
create index if not exists idx_lot_photos_lot   on public.lot_photos(lot_id, posicao);

-- ============================ 2. STORAGE ====================================
-- Buckets públicos p/ upload de imagens (a coluna *_url guarda a URL pública).

insert into storage.buckets (id, name, public) values
  ('lot-photos','lot-photos', true),
  ('category-icons','category-icons', true),
  ('article-covers','article-covers', true),
  ('avatars','avatars', true)
on conflict (id) do nothing;

drop policy if exists "media_public_read"   on storage.objects;
drop policy if exists "media_proto_insert"  on storage.objects;
drop policy if exists "media_proto_update"  on storage.objects;
drop policy if exists "media_proto_delete"  on storage.objects;

create policy "media_public_read" on storage.objects for select
  using (bucket_id in ('lot-photos','category-icons','article-covers','avatars'));

-- ⚠️ PROTÓTIPO: upload liberado. Em produção troque o `with check (true)` por
--    `auth.role() = 'authenticated'` (ou uma regra por pasta/usuário).
create policy "media_proto_insert" on storage.objects for insert
  with check (bucket_id in ('lot-photos','category-icons','article-covers','avatars'));
create policy "media_proto_update" on storage.objects for update
  using (bucket_id in ('lot-photos','category-icons','article-covers','avatars'));
create policy "media_proto_delete" on storage.objects for delete
  using (bucket_id in ('lot-photos','category-icons','article-covers','avatars'));

-- ============================ 3. RLS ========================================
-- PROTÓTIPO: acesso liberado (anon) em todas as tabelas. Endurecer em produção
-- (ver bloco comentado no final do arquivo).

do $$
declare t text;
begin
  foreach t in array array[
    'profiles','categories','transactions','lots','lot_photos','lot_documents',
    'lot_bids','favorites','articles','methodology_steps','learning_tracks'
  ] loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists "proto_all" on public.%I;', t);
    execute format('create policy "proto_all" on public.%I for all using (true) with check (true);', t);
  end loop;
end $$;

-- ============================ 4. SEED (idempotente) =========================

do $$
declare
  demo uuid := '11111111-1111-1111-1111-111111111111';
  l1 bigint; l2 bigint; l3 bigint; l4 bigint; l5 bigint; l6 bigint;
begin
  -- reset (respeitando FKs)
  delete from public.lot_bids;
  delete from public.lot_photos;
  delete from public.lot_documents;
  delete from public.favorites;
  delete from public.transactions where user_id = demo;
  delete from public.categories   where user_id = demo;
  delete from public.lots;
  delete from public.articles;
  delete from public.methodology_steps;
  delete from public.learning_tracks;

  -- perfil
  insert into public.profiles (id, nome, email, renda, saldo)
  values (demo, 'Paula', 'paula@email.com', 6500, 4230.45)
  on conflict (id) do update
    set nome = excluded.nome, email = excluded.email,
        renda = excluded.renda, saldo = excluded.saldo;

  -- categorias
  insert into public.categories (user_id, nome, emoji, planejado, gasto, posicao, em_transacoes) values
    (demo, 'Moradia',              '🏠',      1800, 1800,   0, true),
    (demo, 'Alimentação',          '🥗',      1200, 986.40, 1, true),
    (demo, 'Transporte',           '🚌',       500, 342.90, 2, true),
    (demo, 'Lazer',                '🌸',       400, 431.20, 3, true),
    (demo, 'Beleza & Autocuidado', '💆🏻‍♀️',    300, 185,    4, true),
    (demo, 'Reserva',              '🪺',       800, 800,    5, false),
    (demo, 'Investir em Leilões',  '🏛️',       600, 0,      6, false);

  -- transações
  insert into public.transactions (user_id, tipo, valor, category_id, descricao, data) values
    (demo, 'out', 86.40, (select id from public.categories where user_id=demo and nome='Alimentação'),          'Mercado da semana',      '2026-07-16'),
    (demo, 'out', 54.90, (select id from public.categories where user_id=demo and nome='Lazer'),                'Cinema com as amigas',   '2026-07-14'),
    (demo, 'in',  450,   null,                                                                                   'Freela de design',       '2026-07-12'),
    (demo, 'out', 120,   (select id from public.categories where user_id=demo and nome='Beleza & Autocuidado'), 'Salão — corte e escova', '2026-07-10'),
    (demo, 'out', 38.50, (select id from public.categories where user_id=demo and nome='Transporte'),           'Recarga do cartão',      '2026-07-09');

  -- lotes (ends_at relativo ao agora = contagem regressiva real)
  insert into public.lots (categoria,emoji,nome,specs,status,descricao,valor_mercado,preco_atual,incremento,ends_at,lances,rentabilidade,risco,revenda,analise_ia,recomendado) values
    ('Imóveis','🏢','Apartamento 2 dorms — Centro, Curitiba/PR','64m² · 2 dormitórios · 1 vaga · Sala ampla','Ocupado · Venda direta · Ótima oportunidade','Apto de 64m² com 2 dormitórios, sala ampla e 1 vaga. Ocupado, venda direta. Ótima oportunidade abaixo da avaliação.',225000,148000,2000, now()+interval '2 days 14 hours',12,'32%','Baixo','60 a 90 dias','Excelente oportunidade para primeira compra. Alta demanda para locação e revenda.',true)
    returning id into l1;
  insert into public.lots (categoria,emoji,nome,specs,status,descricao,valor_mercado,preco_atual,incremento,ends_at,lances,rentabilidade,risco,revenda,analise_ia,recomendado) values
    ('Veículos','🚙','Honda HR-V EXL 1.8 — 2021, 42.000 km','42.000 km · Automático · Flex','Revisões em dia · Único dono','SUV automático, único dono, revisões em dia e documentação pronta para transferência. Ótimo estado de conservação.',96000,72500,500, now()+interval '8 hours 20 minutes',27,'18%','Baixo','30 a 60 dias','Modelo com alta liquidez e depreciação lenta. Boa margem para revenda rápida.',false)
    returning id into l2;
  insert into public.lots (categoria,emoji,nome,specs,status,descricao,valor_mercado,preco_atual,incremento,ends_at,lances,rentabilidade,risco,revenda,analise_ia,recomendado) values
    ('Imóveis','🏡','Casa 3 dorms com quintal — Londrina/PR','120m² · 3 dormitórios · Terreno 300m²','Desocupada · Aceita financiamento em até 30x','Casa térrea de 120m² em terreno de 300m². Desocupada, aceita financiamento do arremate em até 30x.',390000,212000,3000, now()+interval '5 days 2 hours',6,'38%','Médio','90 a 120 dias','Grande potencial de valorização no bairro. Ideal para reforma e revenda.',false)
    returning id into l3;
  insert into public.lots (categoria,emoji,nome,specs,status,descricao,valor_mercado,preco_atual,incremento,ends_at,lances,rentabilidade,risco,revenda,analise_ia,recomendado) values
    ('Joias','💍','Lote de joias em ouro 18k — 92g','92g · Ouro 18k · Anéis, correntes e brincos','Com certificado de autenticidade','Conjunto com anéis, correntes e brincos em ouro 18k, com certificado de autenticidade e nota de avaliação.',32000,18400,200, now()+interval '1 day 6 hours',19,'22%','Baixo','15 a 45 dias','Ouro preserva valor e tem revenda ágil. Boa opção de entrada em patrimônio.',false)
    returning id into l4;
  insert into public.lots (categoria,emoji,nome,specs,status,descricao,valor_mercado,preco_atual,incremento,ends_at,lances,rentabilidade,risco,revenda,analise_ia,recomendado) values
    ('Eletrônicos','💻','Lote 12 notebooks corporativos i7','12 unidades · i7 11ª ger. · 16GB · SSD 512GB','Frota corporativa renovada · Funcionando','Notebooks Dell Latitude i7 11ª geração, 16GB RAM, SSD 512GB. Frota corporativa renovada, funcionando.',42000,19800,300, now()+interval '3 days 9 hours',15,'28%','Médio','30 a 60 dias','Revenda unitária aumenta a margem. Demanda alta no mercado de usados.',false)
    returning id into l5;
  insert into public.lots (categoria,emoji,nome,specs,status,descricao,valor_mercado,preco_atual,incremento,ends_at,lances,rentabilidade,risco,revenda,analise_ia,recomendado) values
    ('Veículos','🛵','Honda PCX 160 — 2023, 8.500 km','8.500 km · Automática · Flex','IPVA pago · Sem restrições','Scooter econômica, ideal para o dia a dia. IPVA pago, sem restrições, pequenos riscos de uso.',16500,9200,150, now()+interval '12 hours 45 minutes',9,'20%','Baixo','15 a 45 dias','Scooter econômica e muito procurada. Giro rápido de revenda.',false)
    returning id into l6;

  -- fotos da galeria
  insert into public.lot_photos (lot_id, emoji, posicao) values
    (l1,'🏢',0),(l1,'🛋️',1),(l1,'🍳',2),
    (l2,'🚙',0),(l2,'🪑',1),(l2,'⚙️',2),
    (l3,'🏡',0),(l3,'🌳',1),(l3,'🛁',2),
    (l4,'💍',0),(l4,'📿',1),(l4,'👂',2),
    (l5,'💻',0),(l5,'🖥️',1),(l5,'🔌',2),
    (l6,'🛵',0),(l6,'🪖',1),(l6,'🔧',2);

  -- documentos
  insert into public.lot_documents (lot_id, nome, posicao) values
    (l1,'Edital do leilão (PDF)',0),(l1,'Matrícula do imóvel',1),(l1,'Laudo de avaliação',2),(l1,'Certidões negativas',3),
    (l2,'Edital do leilão (PDF)',0),(l2,'Laudo cautelar',1),(l2,'Débitos e multas (zerado)',2),
    (l3,'Edital do leilão (PDF)',0),(l3,'Matrícula do imóvel',1),(l3,'Laudo de avaliação',2),
    (l4,'Edital do leilão (PDF)',0),(l4,'Certificado de autenticidade',1),
    (l5,'Edital do leilão (PDF)',0),(l5,'Nota fiscal de origem',1),
    (l6,'Edital do leilão (PDF)',0),(l6,'Laudo cautelar',1);

  -- histórico de lances
  insert into public.lot_bids (lot_id, bidder_name, valor, is_me, created_at) values
    (l1,'A. Ribeiro',148000,false, now()-interval '1 hour'),
    (l1,'C. Souza',  146000,false, now()-interval '3 hours'),
    (l1,'A. Ribeiro',144000,false, now()-interval '6 hours'),
    (l2,'Você',      72500, true,  now()-interval '20 minutes'),
    (l2,'M. Fernandes',72000,false,now()-interval '2 hours'),
    (l2,'Você',      71500, true,  now()-interval '4 hours'),
    (l2,'J. Prado',  71000, false, now()-interval '6 hours'),
    (l4,'R. Lima',   18400, false, now()-interval '30 minutes'),
    (l4,'Você',      18200, true,  now()-interval '2 hours'),
    (l4,'P. Alves',  18000, false, now()-interval '5 hours');

  -- favoritos da Paula
  insert into public.favorites (user_id, lot_id) values (demo, l1), (demo, l6);

  -- artigos
  insert into public.articles (tag, emoji, titulo, tempo_leitura, posicao, corpo_html) values
    ('Reserva','🏦','Reserva estratégica: por que ela é o primeiro passo para investir','5 min de leitura',0,
      '<h1>Reserva estratégica: o primeiro passo</h1><div class="meta">Reserva · 5 min de leitura</div><p>Antes de qualquer investimento vem a reserva. Ela é o colchão que te dá tranquilidade para investir sem medo — e para não precisar sacar no pior momento.</p><h3>1. Quanto guardar</h3><p>Comece mirando de 3 a 6 meses dos seus gastos essenciais. Constância é o que importa: um pouco todo mês já muda o jogo.</p><h3>2. Onde deixar</h3><p>A reserva precisa de liquidez e segurança. É dinheiro para dormir tranquila, não para arriscar.</p><h3>3. Só então, invista</h3><p>Com a reserva formada, sua sobra mensal fica livre para construir patrimônio — inclusive nos leilões.</p>'),
    ('Orçamento','⚠️','5 erros que impedem você de fazer dinheiro sobrar no mês','5 min de leitura',1,
      '<h1>5 erros que impedem a sobra</h1><div class="meta">Orçamento · 5 min de leitura</div><p>Sobrar dinheiro no fim do mês raramente é sorte — é método.</p><h3>1. Olhar só para o saldo</h3><p>O saldo não sabe que a fatura vence semana que vem. Gaste olhando para a categoria.</p><h3>2. Não dar destino a cada real</h3><p>Dinheiro sem destino evapora. Distribua tudo assim que o salário cai.</p><h3>3. Tratar a sobra como sobra</h3><p>Sobra planejada vira patrimônio. Trate-a como conta a pagar para o seu futuro.</p><h3>4. Ignorar os pequenos gastos</h3><p>Os pequenos gastos somados estouram o mês. Registre tudo.</p><h3>5. Desistir no primeiro deslize</h3><p>Todo mês é um recomeço. Consistência vence perfeição.</p>'),
    ('Leilões','🏛️','Entenda os leilões e compre abaixo do valor de mercado','7 min de leitura',2,
      '<h1>Entenda os leilões</h1><div class="meta">Leilões · 7 min de leitura</div><p>Leilão não é cassino — é compra planejada com desconto. O segredo está em três etapas antes do primeiro lance.</p><h3>1. Leia o edital inteiro</h3><p>O edital diz se o imóvel está ocupado e como funciona o pagamento.</p><h3>2. Defina seu teto</h3><p>Calcule custos extras e defina o valor máximo com base na sua sobra — nunca no calor da disputa.</p><h3>3. Comece pequeno</h3><p>Lotes menores, como veículos e eletrônicos, são ótimos para aprender.</p>'),
    ('Método','🪷','Dê um trabalho para cada real: o método que muda tudo','6 min de leitura',3,
      '<h1>Dê um trabalho para cada real</h1><div class="meta">Método Innera · 6 min de leitura</div><p>O método Innera inverte a pergunta do fim do mês: o que cada real vai fazer por você este mês?</p><h3>1. Todo real tem um destino</h3><p>Distribua tudo entre as categorias assim que o salário cai — inclusive a sobra.</p><h3>2. Gaste olhando para a categoria</h3><p>O saldo mente; a categoria sabe quanto ainda há disponível.</p><h3>3. A sobra é uma categoria</h3><p>Sobra planejada vira patrimônio, com ponte direta para os leilões.</p>');

  -- metodologia Innera
  insert into public.methodology_steps (passo, titulo, descricao) values
    (1,'Organize cada real','Dê um destino para cada real que entra no mês.'),
    (2,'Crie sua reserva','Construa a tranquilidade que abre espaço para investir.'),
    (3,'Invista com inteligência','Faça sua sobra render com estratégia e propósito.'),
    (4,'Compre patrimônio','Use os leilões para comprar abaixo do valor de mercado.'),
    (5,'Multiplique sua liberdade','Transforme patrimônio em liberdade financeira.');

  -- trilhas
  insert into public.learning_tracks (titulo, subtitulo, emoji, total_aulas, aula_atual, progresso, destaque, posicao) values
    ('Do orçamento ao primeiro lance: sua jornada de patrimônio','4 aulas curtas sobre organizar o mês, criar sobra e participar do primeiro leilão com segurança.','💡',4,1,0,true,0),
    ('Organização financeira','Aula 2 — Como criar sua reserva e ter tranquilidade','📓',4,2,60,false,1);
end $$;

-- ============================================================================
-- PRODUÇÃO (endurecer depois): substituir a policy "proto_all" por regras reais,
-- por exemplo — catálogo público e dados da usuária ligados ao login:
--
--   -- catálogo: leitura pública
--   drop policy if exists "proto_all" on public.lots;
--   create policy "lots_read" on public.lots for select using (true);
--
--   -- dados da usuária: apenas o dono (Supabase Auth)
--   drop policy if exists "proto_all" on public.transactions;
--   create policy "tx_own" on public.transactions
--     for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
--   -- (idem para categories, favorites, lot_bids, profiles…)
-- ============================================================================
