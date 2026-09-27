/**
 * Pure cash-reconciliation math, kept separate from the DB/API layer so it can be
 * unit-tested directly (see __tests__/shifts.test.ts) without a live database.
 */
export function computeExpectedCash(params: {
  openingCash: number;
  cashSales: number;
  cashIn: number;
  cashOut: number;
  cashRefunds: number;
}): number {
  return params.openingCash + params.cashSales + params.cashIn - params.cashOut - params.cashRefunds;
}

export function computeVariance(actualCash: number, expectedCash: number): number {
  return round2(actualCash - expectedCash);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
