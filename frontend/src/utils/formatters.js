export function formatCurrency(value) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(value || 0));
}

export function formatWeight(value) {
  return `${Number(value || 0).toFixed(2)} g`;
}

export function formatPercent(value) {
  return `${Number(value || 0).toFixed(2)}%`;
}
