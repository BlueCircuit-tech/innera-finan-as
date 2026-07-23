# Innera — Finanças & Leilões (APP PAULA)

Protótipo navegável de um app de finanças pessoais orientado ao público feminino, com ponte para investimento em leilões via **inneraleiloes.com.br**. Identidade visual em **verde profundo com detalhes em dourado**, 100% dados mockados — nenhuma transação é real.

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
  data.js             dados mockados (categorias, lotes, artigos, metodologia)
  styles.css          design system (tokens, primitivos)
  screens.css         estilos específicos de tela
  components/         ui.jsx (CountUp, Meter, Ring, Sheet, Toast…), LotCard.jsx
  screens/            Intro, Home, Budget, AddTx, Sobra, Auctions, LotDetail, MyBids, Learn, Article
reference/            protótipo original em HTML (antes da migração para React)
supabase/init.sql     schema + storage (upload de imagens) + RLS + seed
```

## Banco de dados (Supabase)

`supabase/init.sql` cria as tabelas, os buckets de Storage para upload de imagens
e popula tudo com os dados atuais (fictícios). Cada entidade tem `emoji` (placeholder)
e uma coluna `*_url` — mostre a imagem quando existir, senão caia no emoji. Cole o
arquivo no **SQL Editor do Supabase** e clique em RUN (é idempotente).

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

## Interatividade mockada

- Dar lance atualiza o lance atual, o histórico e o status em "Meus Lances"
- Registrar transação atualiza saldo, gasto da categoria e lista de últimas transações
- Ajustar orçamento recalcula "a alocar" em tempo real
- Favoritar sincroniza feed, detalhe e aba Favoritos
