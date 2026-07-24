-- ============================================================================
-- INNERA — Extensão do painel admin: podcasts e vídeos
-- Rode UMA vez no SQL Editor do Supabase (RUN). Idempotente.
-- ============================================================================

create extension if not exists pgcrypto;

create table if not exists public.media_items (
  id         uuid primary key default gen_random_uuid(),
  tipo       text not null check (tipo in ('podcast','video')),
  titulo     text not null,
  descricao  text,
  url        text not null,
  thumb_url  text,
  posicao    int not null default 0,
  publicado  boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.media_items enable row level security;
drop policy if exists "proto_all" on public.media_items;
create policy "proto_all" on public.media_items for all using (true) with check (true);

-- seed inicial (só se a tabela estiver vazia)
insert into public.media_items (tipo, titulo, descricao, url, posicao)
select 'podcast', 'Podcast Paula Leiloeira', 'Episódios sobre leilões e construção de patrimônio.',
       'https://www.youtube.com/playlist?list=PLnrgsxAp5AfM4TtVgWwXuwoCqHI2cG1WO', 0
where not exists (select 1 from public.media_items);
