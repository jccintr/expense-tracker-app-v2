// Formata número pra "R$ 1.234,56". Envolvido em Number(...) de propósito
// — os endpoints de resumo (summary/week, summary/category) fazem soma via
// SQL bruto, e por segurança tratamos qualquer valor vindo da API como
// possivelmente string antes de formatar.
export function formatMoney(value) {
  const n = Number(value) || 0;
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Converte o texto digitado no campo de valor pro número que a API espera.
// O teclado numérico do Android mostra vírgula OU ponto dependendo do
// idioma do aparelho, então aceitamos os dois — mas com cuidado pra não
// confundir um ponto DECIMAL ("35.90") com ponto de MILHAR ("1.234,56"):
// só tratamos pontos como separador de milhar quando o texto também tem
// vírgula (aí sim é inequívoco que a vírgula é o separador decimal).
export function parseAmountInput(text) {
  if (!text) return NaN;
  const hasComma = text.includes(',');
  const normalized = hasComma ? text.replace(/\./g, '').replace(',', '.') : text;
  return Number(normalized);
}
