// Utilitários de data. Dois cuidados que existem por causa de como a API
// (api-expense-tracker-adonis) realmente se comporta — confirmado testando
// a API rodando de verdade, não só lendo o código:
//
// 1. O filtro por dia (`GET /transactions?data=AAAA-MM-DD`) é ancorado em
//    horário de São Paulo (a query SQL faz
//    `created_at AT TIME ZONE 'America/Sao_Paulo'`), não UTC e não o fuso
//    do aparelho. O Brasil não tem mais horário de verão desde 2019, então
//    América/São_Paulo é um offset fixo de UTC-3 o ano inteiro — dá pra
//    calcular isso com aritmética simples, sem precisar de uma lib de fuso
//    horário pesada. Se o Brasil um dia voltar a ter horário de verão,
//    isso precisa ser revisto.
//
// 2. O `week_number` default do endpoint `/transactions/summary/week` (quando
//    você não passa o parâmetro) tem um bug: ele calcula a semana ERRADA —
//    testei e ele devolve a semana QUE VEM em vez da atual. A função
//    `getWeekRange(weekNumber)` do servidor em si é uma função pura e
//    correta (é só a escolha do "qual número passar por padrão" que erra).
//    Por isso este arquivo NUNCA deixa a API escolher a semana sozinha —
//    sempre calculamos e mandamos o week_number explícito.

const SAO_PAULO_OFFSET_MS = -3 * 60 * 60 * 1000; // UTC-3, fixo (sem DST)

// Converte um Date (instante real, qualquer fuso) pro "Date de calendário"
// equivalente em América/São_Paulo — os getters UTC desse resultado (getUTCFullYear
// etc.) já refletem o dia/mês/ano corretos em SP, sem depender do fuso do
// aparelho rodando o app.
function toSaoPauloCalendarDate(date) {
  return new Date(date.getTime() + SAO_PAULO_OFFSET_MS);
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

// 'AAAA-MM-DD' de um Date, no calendário de São Paulo — é o formato que
// `GET /transactions?data=` espera.
export function formatDateSP(date) {
  const spDate = toSaoPauloCalendarDate(date);
  return `${spDate.getUTCFullYear()}-${pad2(spDate.getUTCMonth() + 1)}-${pad2(spDate.getUTCDate())}`;
  //return `${pad2(spDate.getUTCDate())}-${pad2(spDate.getUTCMonth() + 1)}-${spDate.getUTCFullYear()}`;
}

// "Agora", como um Date — usado só como ponto de partida pra navegação de
// dia/semana/mês; a comparação de qual DIA isso representa sempre passa
// por formatDateSP (ou funções que já levam em conta o fuso de SP).
export function nowSP() {
  return new Date();
}

// Soma (ou subtrai, com n negativo) dias a uma data 'AAAA-MM-DD',
// devolvendo outra 'AAAA-MM-DD'. Usada pra navegação dia-a-dia na tela de
// Transações. Meio-dia UTC evita qualquer risco de a operação de soma de
// dias cruzar sozinha uma borda de fuso.
export function addDaysToDateString(dateStr, n) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const base = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  base.setUTCDate(base.getUTCDate() + n);
  return `${base.getUTCFullYear()}-${pad2(base.getUTCMonth() + 1)}-${pad2(base.getUTCDate())}`;
}

export function isSameDateString(a, b) {
  return a === b;
}

// Label amigável: "Hoje", "Ontem", "Amanhã" ou "seg, 12 de out".
const WEEKDAYS_SHORT = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const MONTHS_SHORT = [
  'jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez',
];

export function formatDayLabel(dateStr) {
  const todayStr = formatDateSP(nowSP());
  const yesterdayStr = addDaysToDateString(todayStr, -1);
  const tomorrowStr = addDaysToDateString(todayStr, 1);

  if (dateStr === todayStr) return 'Hoje';
  if (dateStr === yesterdayStr) return 'Ontem';
  if (dateStr === tomorrowStr) return 'Amanhã';

  const [y, m, d] = dateStr.split('-').map(Number);
  const base = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return `${WEEKDAYS_SHORT[base.getUTCDay()]}, ${d} de ${MONTHS_SHORT[m - 1]}`;
}

export function isFutureDateString(dateStr) {
  return dateStr > formatDateSP(nowSP());
}

export function isTodayDateString(dateStr) {
  return dateStr === formatDateSP(nowSP());
}

// ===== Semana (para o gráfico de barra semanal) =====
//
// Replica EXATAMENTE a lógica de getWeekRange(weekNumber) do servidor
// (transactions_controller.ts), mas calculada aqui no cliente — porque
// isso permite calcular o week_number CORRETO pra "semana atual" sem
// depender do endpoint default (que tem o bug descrito no topo do
// arquivo). getWeekRange em si (a função pura: "dado um weekNumber, qual
// o intervalo segunda-domingo") está correta no servidor — só o valor
// default que ele escolhe sozinho é que erra. Replicando a função pura
// aqui, conseguimos calcular o weekNumber certo e mandar explícito toda
// vez, e a navegação anterior/próxima semana continua sendo só ±1.
function getWeekRangeLikeServer(weekNumber, year) {
  const firstDayOfYear = new Date(Date.UTC(year, 0, 1, 12, 0, 0));
  const daysOffset = (weekNumber - 1) * 7;
  const refDate = new Date(firstDayOfYear.getTime() + daysOffset * 86400000);

  const dayOfWeek = refDate.getUTCDay(); // 0=dom...6=sáb
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const firstDay = new Date(refDate);
  firstDay.setUTCDate(refDate.getUTCDate() - mondayOffset);

  const y = firstDay.getUTCFullYear();
  const m = pad2(firstDay.getUTCMonth() + 1);
  const d = pad2(firstDay.getUTCDate());
  return `${y}-${m}-${d}`;
}

// Calcula o week_number (no esquema do PRÓPRIO servidor) que contém a data
// 'AAAA-MM-DD' informada. Calibra achando a segunda-feira da semana 1 do
// ano e contando quantos blocos de 7 dias faltam até a segunda-feira da
// semana que contém targetDateStr — como getWeekRange soma semanas
// inteiras (7 dias exatos) a cada +1 no weekNumber, essa relação é linear
// e exata, sem precisar reproduzir arredondamento nenhum.
export function getServerWeekNumberForDate(targetDateStr) {
  const [ty] = targetDateStr.split('-').map(Number);

  const week1Monday = getWeekRangeLikeServer(1, ty);

  // Segunda-feira da semana que CONTÉM targetDateStr (independente do
  // weekNumber do servidor) — cálculo direto, sem depender da API.
  const [y, m, d] = targetDateStr.split('-').map(Number);
  const target = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  const dow = target.getUTCDay();
  const mondayOffset = dow === 0 ? 6 : dow - 1;
  const targetMonday = new Date(target);
  targetMonday.setUTCDate(target.getUTCDate() - mondayOffset);

  const week1MondayDate = new Date(week1Monday + 'T12:00:00Z');
  const diffDays = Math.round((targetMonday.getTime() - week1MondayDate.getTime()) / 86400000);

  return 1 + Math.round(diffDays / 7);
}

export function getCurrentServerWeekNumber() {
  return getServerWeekNumberForDate(formatDateSP(nowSP()));
}
