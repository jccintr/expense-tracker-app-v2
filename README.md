# Expense Tracker App

App mobile (Expo SDK 54, React Native, JavaScript, React Navigation) pra
consumir a [`api-expense-tracker-adonis`](https://github.com/jccintr/api-expense-tracker-adonis)
(AdonisJS).

## Rodando o projeto

```bash
npm install
npx expo start
```

Antes de rodar, edite `src/constants/api.js` com a URL real da sua API
(instruções de emulador Android vs. device físico no próprio arquivo).

## Duas peculiaridades reais da API — testei rodando ela de verdade

Antes de escrever qualquer tela, subi um Postgres local e rodei a API de
verdade pra confirmar formato de resposta e comportamento, em vez de só ler
o código. Achei duas coisas que moldaram o código do app:

**1. Bug no `week_number` default do gráfico semanal.** Se você chamar
`GET /transactions/summary/week` sem passar `?week_number=`, a API tenta
calcular a semana atual sozinha — e erra em uma semana (devolve a semana
QUE VEM, não a atual). Reproduzi de forma consistente. Por isso o app
**nunca** deixa a API escolher a semana sozinha: `utils/date.js` replica a
lógica pura de `getWeekRange()` do próprio servidor (essa função em si está
correta) e calcula o `week_number` certo no cliente, sempre enviado
explícito. Validei esse cálculo contra a API rodando de verdade, inclusive
em bordas de ano (semana 1, semana 52/53).

**2. Formato de erro inconsistente entre endpoints.** Encontrei 3 formatos
diferentes (`{errors:[{message}]}` pra validação/token inválido,
`{error, message}` pras exceções customizadas de accounts/categories/
transactions, `{error}` sozinho em alguns pontos dos controllers). O
`api/client.js` tem um `extractErrorMessage()` que tenta os 3 nessa ordem
de prioridade.

## Limitação real da API: não dá pra criar transação retroativa

`POST /transactions` não aceita nenhum campo de data — toda transação nasce
com o timestamp atual do servidor, sempre. Não tem como cadastrar um gasto
de ontem por essa API. `TransacaoFormScreen` avisa isso na tela de criação,
e `TransacoesScreen` traz a navegação de volta pro dia de hoje depois de
criar uma transação (senão o usuário ficaria olhando pro dia errado,
"sem ver" a transação que acabou de criar).

## Fuso horário: filtro por dia é ancorado em América/São_Paulo

`GET /transactions?data=AAAA-MM-DD` filtra em horário de São Paulo (a API
faz `created_at AT TIME ZONE 'America/Sao_Paulo'`), não UTC. Como o Brasil
não tem mais horário de verão desde 2019, `utils/date.js` usa um offset
fixo de UTC-3 pra calcular isso — mais simples e confiável que carregar uma
lib de fuso horário só por causa disso. Se o Brasil voltar a ter DST, essa
parte precisa ser revista.

## Estrutura

```
src/
├── api/            # client.js (extração de erro multi-formato) + authApi/
│                    # accountsApi/categoriesApi/transactionsApi
├── components/      # PrimaryButton, TransactionRow, ConfirmModal,
│                    # WeeklyBarChart, MonthlyPieChart (react-native-svg puro)
│   └── inputs/       # TextField, PasswordField, SelectField
├── context/         # AuthContext (token/usuário), DataContext (contas/categorias
│                    # compartilhadas — pré-carregadas no login)
├── theme/           # colors.js (paleta light/dark) + ThemeContext (segue o sistema)
├── navigation/       # RootNavigator (Stack) + TabNavigator (Transações/Gráficos/Perfil)
├── utils/           # date.js (fuso SP + o workaround do week_number), money.js
└── screens/         # as 13 telas do app
```

## Telas

Auth: Preload, Login, Cadastro.
Principal: **Transações** (aba inicial — navegação dia a dia com setas e
seletor de data, total do dia, criar/editar/excluir).
**Gráficos** (aba — alternância Semana/Mês, cada um com navegação
anterior/próximo): barra semanal (segunda a domingo) e pizza mensal por
categoria.
**Perfil** (aba — dados do usuário, atalhos pra Contas/Categorias, logout).
Busca: tela dedicada (ícone de lupa no header de Transações), com filtros
de descrição/período/categoria/conta.
Contas e Categorias: listas com criar/editar/excluir (409 tratado com
mensagem própria quando há transação vinculada).
Modais: TransacaoForm, ContaForm, CategoriaForm.

## Tema

Claro/escuro segue o sistema automaticamente (`useColorScheme`), sem
seletor manual — mesmo comportamento do app irmão (Simple Todo mobile). Se
quiser um seletor manual como na versão web do Simple Todo, é fácil
evoluir `ThemeContext.js` pra isso depois.

## Validado, não visto renderizado

Rodei `npx expo export --platform android` (bundle real via Metro, 1160
módulos, sem erro) e `npx expo-doctor` (16/18 — os 2 que falham são só
chamadas bloqueadas de rede pro expo.dev neste sandbox, não é problema do
projeto) neste ambiente, mas não há como abrir num emulador/device aqui.
O primeiro `npx expo start` do seu lado é o teste real de renderização —
recomendo testar com atenção especial a: navegação de dia mostrando o dia
certo (fuso), os dois gráficos com dados reais, e o aviso ao criar
transação num dia diferente de hoje.
