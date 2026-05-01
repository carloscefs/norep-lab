export const COACH_QUOTES = [
  "Se você consegue contar, está leve.",
  "Falha é o início do estímulo.",
  "Pare quando o músculo falhar, não quando o número acabar.",
  "Tensão contínua. Sem pressa. Sem trapaça.",
  "Mais peso não é melhor. Falha técnica é.",
  "Não conte repetições. Conte segundos sob tensão.",
  "Intensidade define resultado.",
  "Cada série tem que doer. Tem que arder.",
  "O músculo não sabe quanto pesa. Ele sabe quanto sofreu.",
  "Falhar é o trabalho. Tudo antes é aquecimento.",
  "Quem para antes da falha treina pela metade.",
  "Volume sem intensidade é só calistenia disfarçada.",
];

export function quoteAt(index: number): string {
  return COACH_QUOTES[index % COACH_QUOTES.length];
}
