-- ============================================================================
-- INNERA — Autenticação SIMPLES (sem confirmação de e-mail)
-- Rode UMA vez no SQL Editor do Supabase (RUN). Idempotente.
--
-- Modelo:
--   • Tabela app_users guarda nome, e-mail, telefone e a senha (com hash bcrypt).
--   • Cadastro/login via funções (app_signup / app_login) — a senha NUNCA sai do
--     banco; a tabela app_users não é lida diretamente pelo app.
--   • Sem e-mail de confirmação e sem limite de envio de e-mails.
--   • As finanças (categorias, transações, favoritos, lances) ficam separadas por
--     usuário no nível do app (coluna user_id) — políticas liberadas para o app
--     gravar/ler. Adequado para esta fase; em produção dá para endurecer depois.
-- ============================================================================

create extension if not exists pgcrypto;

-- 1) Usuários do app --------------------------------------------------------
create table if not exists public.app_users (
  id           uuid primary key default gen_random_uuid(),
  nome         text not null,
  email        text not null unique,
  telefone     text,
  senha_hash   text not null,
  renda        numeric not null default 0,
  avatar_emoji text default '👩🏻',
  created_at   timestamptz not null default now()
);

-- app_users fica trancada: só as funções abaixo (security definer) acessam.
alter table public.app_users enable row level security;
-- (sem policy para anon => ninguém lê senha/e-mail direto pela API)

-- 2) Remove as políticas antigas baseadas em login do Supabase e libera o
--    acesso do app às tabelas pessoais (isolamento por user_id no app) --------
do $$
declare t text;
begin
  foreach t in array array['categories','transactions','favorites','lot_bids'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "own_rows" on public.%I', t);
    execute format('drop policy if exists "proto_all" on public.%I', t);
    execute format('create policy "proto_all" on public.%I for all using (true) with check (true)', t);
  end loop;
end $$;

-- Remove as FKs antigas de user_id (apontavam para profiles/auth.users).
-- Agora o usuário mora em app_users; a relação é feita no nível do app.
do $$
declare r record;
begin
  for r in
    select c.conrelid::regclass::text as tbl, c.conname
    from pg_constraint c
    join pg_attribute a on a.attrelid = c.conrelid and a.attnum = any (c.conkey)
    where c.contype = 'f'
      and a.attname = 'user_id'
      and c.conrelid in ('public.categories'::regclass, 'public.transactions'::regclass,
                         'public.favorites'::regclass, 'public.lot_bids'::regclass)
  loop
    execute format('alter table %s drop constraint if exists %I', r.tbl, r.conname);
  end loop;
end $$;

-- 3) Cadastro ---------------------------------------------------------------
create or replace function public.app_signup(p_nome text, p_email text, p_telefone text, p_senha text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare uid uuid; mail text := lower(btrim(p_email));
begin
  if p_nome is null or btrim(p_nome) = '' then raise exception 'NOME_OBRIGATORIO'; end if;
  if mail = '' then raise exception 'EMAIL_OBRIGATORIO'; end if;
  if length(coalesce(p_senha,'')) < 6 then raise exception 'SENHA_CURTA'; end if;
  if exists (select 1 from app_users where lower(email) = mail) then raise exception 'EMAIL_EXISTS'; end if;

  insert into app_users (nome, email, telefone, senha_hash)
  values (btrim(p_nome), mail, nullif(btrim(p_telefone), ''), crypt(p_senha, gen_salt('bf')))
  returning id into uid;

  -- categorias padrão
  insert into categories (id, user_id, nome, emoji, planejado, gasto, posicao, em_transacoes) values
    (gen_random_uuid(), uid, 'Moradia',              '🏠',    0, 0, 0, true),
    (gen_random_uuid(), uid, 'Alimentação',          '🥗',    0, 0, 1, true),
    (gen_random_uuid(), uid, 'Transporte',           '🚌',    0, 0, 2, true),
    (gen_random_uuid(), uid, 'Lazer',                '🌸',    0, 0, 3, true),
    (gen_random_uuid(), uid, 'Beleza & Autocuidado', '💆🏻‍♀️', 0, 0, 4, true),
    (gen_random_uuid(), uid, 'Reserva',              '🪺',    0, 0, 5, false),
    (gen_random_uuid(), uid, 'Investir em Leilões',  '🏛️',    0, 0, 6, false);

  return jsonb_build_object('id', uid, 'nome', btrim(p_nome), 'email', mail,
    'telefone', nullif(btrim(p_telefone), ''), 'renda', 0, 'avatar_emoji', '👩🏻');
end;
$$;

-- 4) Login ------------------------------------------------------------------
create or replace function public.app_login(p_email text, p_senha text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare u public.app_users;
begin
  select * into u from app_users where lower(email) = lower(btrim(p_email));
  if not found then return null; end if;
  if u.senha_hash = crypt(p_senha, u.senha_hash) then
    return jsonb_build_object('id', u.id, 'nome', u.nome, 'email', u.email,
      'telefone', u.telefone, 'renda', u.renda, 'avatar_emoji', u.avatar_emoji);
  end if;
  return null;
end;
$$;

-- 5) Usuário atualiza a própria renda ---------------------------------------
create or replace function public.app_update_renda(uid uuid, val numeric)
returns void
language sql
security definer
set search_path = public
as $$
  update app_users set renda = greatest(0, coalesce(val, 0)) where id = uid;
$$;

-- 6) Admin: listar / editar / excluir usuários ------------------------------
create or replace function public.admin_list_users()
returns table (id uuid, nome text, email text, telefone text, created_at timestamptz)
language sql security definer set search_path = public
as $$ select id, nome, email, telefone, created_at from app_users order by created_at desc; $$;

create or replace function public.admin_update_user(uid uuid, novo_nome text, novo_telefone text)
returns void
language sql security definer set search_path = public
as $$
  update app_users
     set nome = coalesce(nullif(btrim(novo_nome), ''), nome),
         telefone = nullif(btrim(novo_telefone), '')
   where id = uid;
$$;

create or replace function public.admin_delete_user(uid uuid)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  delete from public.transactions where user_id = uid;
  delete from public.categories   where user_id = uid;
  delete from public.favorites    where user_id = uid;
  delete from public.lot_bids     where user_id = uid;
  delete from public.app_users    where id = uid;
end;
$$;

grant execute on function public.app_signup(text,text,text,text)     to anon, authenticated;
grant execute on function public.app_login(text,text)                to anon, authenticated;
grant execute on function public.app_update_renda(uuid,numeric)      to anon, authenticated;
grant execute on function public.admin_list_users()                  to anon, authenticated;
grant execute on function public.admin_update_user(uuid,text,text)   to anon, authenticated;
grant execute on function public.admin_delete_user(uuid)             to anon, authenticated;
