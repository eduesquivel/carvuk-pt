export const TAX_RATE = 0.15;

export type ReceiptTotals = {
  gross: number;
  tax: number;
  net: number;
};

export type LineInput = {
  unitPrice: number;
  quantity: number;
};

/**
 * El bruto es lo que paga el cliente; el impuesto es el 15% del bruto
 * (redondeado a pesos) y el neto es el bruto menos el impuesto.
 */
export function calculateTotals(gross: number): ReceiptTotals {
  const tax = Math.round(gross * TAX_RATE);
  return { gross, tax, net: gross - tax };
}

export function calculateGross(lines: LineInput[]): number {
  return lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
}
