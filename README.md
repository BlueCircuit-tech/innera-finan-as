# Innera — Finanças & Leilões (APP PAULA)

App de finanças pessoais orientado ao público feminino, com ponte para investimento em leilões via **inneraleiloes.com.br**. Identidade visual em **verde profundo com detalhes em dourado**.

**Tudo funciona via Supabase (CRUD real):** cada usuária cria sua conta (Supabase Auth) e tem suas próprias categorias, transações e favoritos. O **saldo** e o **gasto por categoria** são sempre **calculados a partir das transações** — não há valor "guardado" que possa desencontrar. Existe também um **painel administrativo** (duas visões) para gerenciar leilões, conteúdos e **usuários** (nome, e-mail, telefone).

## Stack

- **React 18 + Vite** — SPA com componentização por tela
- **Framer Motion** — transições de tela e microinterações (contagem de valores, barras/anéis animados)
- **Lucide** — ícones de interface
- **Fraunces + Inter** (Google Fonts) — display serif + UI

## Como rodar

```bash
npm install
npm run dev      # http://localhost:5173
```

Build de produção:

```bash
npm run build    # gera /dist
npm run preview  # serve o build localmente
```

## Estrutura

```
src/
  main.jsx            entrada
  App.jsx             moldura do device, navegação e nav inferior
  store.jsx           estado global (reducer) + helpers de formatação + toast
  auth.jsx            provider do Supabase Auth (cadastro/login/logout)
  api.js              CRUD com Supabase (leitura escopada ao usuário + admin)
  data.js             conteúdo estático de UI (links, categorias padrão)
  components/MoneyInput.jsx  campo de dinheiro com máscara de centavos (pt-BR)
  styles.css          design system (tokens, primitivos)
  screens.css         estilos específicos de tela
  components/         ui.jsx (CountUp, Meter, Ring, Sheet, Toast…), LotCard.jsx
  screens/            Intro, Home, Budget, AddTx, Sobra, Auctions, LotDetail, MyBids, Learn, Article
reference/            protótipo original em HTML (antes da migração para React)
supabase/init.sql     schema + storage (upload de imagens) + RLS + seed
```

## Banco de dados (Supabase)

`supabase/init.sql` cria as tabelas, os buckets de Storage para upload de imagens
e popula o conteúdo. Cada entidade tem `emoji` (placeholder) e uma coluna `*_url` —
mostra a imagem quando existir, senão cai no emoji. Cole no **SQL Editor** e RUN.

### Autenticação e usuários (obrigatório)

Rode **`supabase/auth.sql`** no SQL Editor (idempotente). Ele cria a tabela
`app_users` e as funções de cadastro/login (`app_signup` / `app_login`), a de renda
(`app_update_renda`) e as do admin (`admin_list_users` / `admin_update_user` /
`admin_delete_user`).

Autenticação **simples, sem confirmação de e-mail**: o cadastro grava nome, e-mail,
telefone e senha (com hash **bcrypt** no banco — a senha nunca sai do banco) e cria as
categorias padrão. O login confere e-mail + senha. A sessão fica no `localStorage`.
Não há e-mail de confirmação nem limite de envio.

### Duas visões

- **Usuário** — o app de finanças (login/cadastro, orçamento, transações, leilões).
- **Admin** — acesse com `?admin` na URL ou pelo link "Área administrativa" na tela de
  login (senha em `VITE_ADMIN_PASSWORD`, padrão `innera2026`). Abas: **Usuários**
  (listar/excluir com nome, e-mail e telefone), Leilões, Artigos e Aprender.

## Telas incluídas no protótipo

| # | Tela | O que faz |
|---|------|-----------|
| 1 | Splash + Onboarding | Branding e 3 slides: organize, tenha sobra, invista em leilões |
| 2 | Login / Cadastro | E-mail/senha, cadastro, recuperação de senha e login social (ilustrativo) |
| 3 | Dashboard (Home) | Saldo, orçado vs. gasto vs. disponível, categorias, destaque da sobra |
| 4 | Orçamento / Categorias | Alocação mensal com steppers, criação de categoria, princípio "um trabalho para cada real" |
| 5 | Adicionar Transação | Receita/despesa, valor, categoria, data, descrição — atualiza saldo e categorias |
| 7 | Minha Sobra | Sobra do mês, gráfico de evolução (6 meses) com tooltip, CTA "Investir em Leilões" |
| 8 | Explorar Leilões | Feed de lotes com filtros por categoria, timer de encerramento, favoritar |
| 9 | Detalhes do Lote | Galeria, avaliação, lance atual, incremento, histórico de lances, documentação, "Dar Lance" funcional |
| 10 | Meus Lances / Favoritos | Status vencendo/superada e lista de lotes salvos |
| 14 | Educação Financeira | Trilha em destaque e artigos completos com leitor interno |

## Escopo real do sistema (referência, fora do protótipo)

Histórico de transações completo (6), Relatórios (11), Perfil (12), Configurações (13), Notificações (15) e Ajuda/Suporte (16) — documentados no briefing para a fase de desenvolvimento.

## Interatividade (dados reais via Supabase)

- Registrar transação insere no banco; **saldo** e **gasto da categoria** são
  recalculados a partir das transações (entradas − saídas)
- Ajustar orçamento (renda e planejado por categoria) recalcula "a alocar" em tempo real
- Favoritar sincroniza feed, detalhe e aba Favoritos, persistindo no banco
- Todos os valores em dinheiro usam o `MoneyInput` (máscara de centavos pt-BR)
