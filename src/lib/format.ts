export function formatDateTime(value?: string) {
  if (!value) return "Nao informado";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export function formatNumber(value?: number, suffix = "") {
  if (typeof value !== "number" || Number.isNaN(value)) return "Nao informado";
  return `${Math.round(value).toLocaleString("pt-BR")}${suffix}`;
}
