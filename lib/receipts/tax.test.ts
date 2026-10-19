import { describe, expect, it } from "vitest";
import { calculateGross, calculateTotals, TAX_RATE } from "./tax";

describe("calculateTotals", () => {
  it("calcula el ejemplo del enunciado", () => {
    const gross = calculateGross([
      { unitPrice: 1100, quantity: 2 },
      { unitPrice: 2000, quantity: 1 },
    ]);
    expect(gross).toBe(4200);
    expect(calculateTotals(gross)).toEqual({ gross: 4200, tax: 630, net: 3570 });
  });

  it("usa siempre una tasa fija de 15%", () => {
    expect(TAX_RATE).toBe(0.15);
  });

  it("redondea el impuesto a pesos enteros y mantiene neto + impuesto = bruto", () => {
    for (const gross of [1, 3, 999, 1001, 12345, 99999]) {
      const { tax, net } = calculateTotals(gross);
      expect(Number.isInteger(tax)).toBe(true);
      expect(net + tax).toBe(gross);
    }
    expect(calculateTotals(1001).tax).toBe(150);
  });

  it("devuelve ceros para un carrito vacío", () => {
    expect(calculateTotals(calculateGross([]))).toEqual({ gross: 0, tax: 0, net: 0 });
  });
});
