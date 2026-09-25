export function formatPercent(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-BR").format(value)
}

export function formatPosition(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 1,
  }).format(value)
}
