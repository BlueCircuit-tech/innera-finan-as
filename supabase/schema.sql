-- ============================================================================
-- INNERA — SCHEMA COMPLETO (rebuild)
--
-- Rode este arquivo UMA vez no SQL Editor do Supabase (RUN) em um projeto novo,
-- e DEPOIS rode supabase/auth.sql (cadastro/login) e supabase/admin.sql (mídia).
--
-- Ordem correta:
--   1) supabase/schema.sql   <- este arquivo (tabelas, RLS, buckets)
--   2) supabase/auth.sql     <- app_signup / app_login / admin_*
--   3) supabase/admin.sql    <- media_items (podcasts e vídeos)
--
-- É idempotente: pode rodar de novo sem apagar nada (usa "if not exists").
-- ============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- 1) Conteúdo público (leilões, artigos, trilhas, metodologia)
-- ---------------------------------------------------------------------------
create table if not exists public.lots (
  id            uuid primary key default gen_random_uuid(),
  categoria     text not null default 'Imóveis',
  emoji         text,
  image_url     text,
  nome          text not null,
  specs         text,
  status        text,
  descricao     text,
  valor_mercado numeric not null default 0,
  preco_atual   numeric not null default 0,
  incremento    numeric not null default 100,
  ends_at       timestamptz not null default now() + interval '3 days',
  lances        int not null default 0,
  rentabilidade text,
  risco         text default 'Baixo',
  revenda       text,
  recomendado   boolean not null default false,
  analise_ia    text,
  created_at    timestamptz not null default now()
);

create table if not exists public.lot_photos (
  id        uuid primary key default gen_random_uuid(),
  lot_id    uuid not null references public.lots(id) on delete cascade,
  emoji     text,
  image_url text,
  posicao   int not null default 0
);

create table if not exists public.lot_documents (
  id      uuid primary key default gen_random_uuid(),
  lot_id  uuid not null references public.lots(id) on delete cascade,
  nome    text not null,
  posicao int not null default 0
);

create table if not exists public.articles (
  id            uuid primary key default gen_random_uuid(),
  tag           text,
  emoji         text default '📄',
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
  passo     int not null default 0,
  titulo    text not null,
  descricao text
);

create table if not exists public.learning_tracks (
  id          uuid primary key default gen_random_uuid(),
  titulo      text not null,
  subtitulo   text,
  emoji       text,
  cover_url   text,
  total_aulas int not null default 0,
  aula_atual  int not null default 0,
  progresso   int not null default 0,
  destaque    boolean not null default false,
  posicao     int not null default 0
);

-- ---------------------------------------------------------------------------
-- 2) Dados por usuária (isolados pela coluna user_id, preenchida pelo app)
--    O usuário mora em app_users (criada em auth.sql) — sem FK aqui de
--    propósito, para este arquivo poder rodar antes do auth.sql.
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null,
  nome          text not null,
  emoji         text,
  image_url     text,
  planejado     numeric not null default 0,
  gasto         numeric not null default 0,
  posicao       int not null default 0,
  em_transacoes boolean not null default true,
  created_at    timestamptz not null default now()
);
create index if not exists categories_user_idx on public.categories(user_id);

create table if not exists public.transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null,
  tipo        text not null check (tipo in ('in', 'out')),
  valor       numeric not null default 0,
  category_id uuid references public.categories(id) on delete set null,
  descricao   text,
  data        date not null default current_date,
  created_at  timestamptz not null default now()
);
create index if not exists transactions_user_idx on public.transactions(user_id, data desc);

create table if not exists public.favorites (
  user_id uuid not null,
  lot_id  uuid not null references public.lots(id) on delete cascade,
  primary key (user_id, lot_id)
);

create table if not exists public.lot_bids (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid,
  lot_id      uuid not null references public.lots(id) on delete cascade,
  bidder_name text,
  valor       numeric not null default 0,
  is_me       boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists lot_bids_lot_idx on public.lot_bids(lot_id);

-- ---------------------------------------------------------------------------
-- 3) RLS — o app usa a chave publishable (anon); nesta fase as políticas são
--    abertas e o isolamento por usuária é feito no app (coluna user_id).
--    A tabela app_users (senhas) fica FECHADA — ver auth.sql.
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'lots','lot_photos','lot_documents','articles','methodology_steps',
    'learning_tracks','categories','transactions','favorites','lot_bids'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "proto_all" on public.%I', t);
    execute format('create policy "proto_all" on public.%I for all using (true) with check (true)', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 4) Storage — buckets públicos usados pelo painel admin
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('lot-photos', 'lot-photos', true), ('article-covers', 'article-covers', true)
on conflict (id) do update set public = true;

do $$
declare b text;
begin
  foreach b in array array['lot-photos','article-covers'] loop
    execute format('drop policy if exists %I on storage.objects', 'innera_read_' || b);
    execute format('drop policy if exists %I on storage.objects', 'innera_write_' || b);
    execute format(
      'create policy %I on storage.objects for select using (bucket_id = %L)',
      'innera_read_' || b, b);
    execute format(
      'create policy %I on storage.objects for insert with check (bucket_id = %L)',
      'innera_write_' || b, b);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 5) Seed mínimo da metodologia (só se estiver vazia) — o resto do conteúdo
--    entra pelo painel admin (?admin na URL).
-- ---------------------------------------------------------------------------
insert into public.methodology_steps (passo, titulo, descricao)
select * from (values
  (1, 'Organize', 'Registre o que entra e o que sai para enxergar seu mês com clareza.'),
  (2, 'Sobre',    'Planeje por categoria e faça sobrar todo mês, sem aperto.'),
  (3, 'Reserve',  'Guarde a sobra numa reserva que cresce mês a mês.'),
  (4, 'Invista',  'Use a reserva para arrematar bens em leilão abaixo do mercado.')
) as v(passo, titulo, descricao)
where not exists (select 1 from public.methodology_steps);
