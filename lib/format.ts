const clpFormatter = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
});

export function formatCLP(value: number): string {
  return clpFormatter.format(value);
}

const dateFormatter = new Intl.DateTimeFormat("es-CL", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Santiago",
});

export function formatDate(value: string): string {
  return dateFormatter.format(new Date(value));
}
