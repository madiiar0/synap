import { COST_PER_MTOK } from "@synapai/shared";

/** USD cost of one call given the model's per-1M-token estimates. */
export function computeCost(model: string, tokensIn: number, tokensOut: number): number {
  const price = COST_PER_MTOK[model] ?? COST_PER_MTOK.default;
  return (tokensIn * price.in + tokensOut * price.out) / 1_000_000;
}

/** Rough token estimate for providers that don't report usage. */
export function estimateTokens(text: string): number {
  return Math.max(1, Math.ceil(text.length / 4));
}
