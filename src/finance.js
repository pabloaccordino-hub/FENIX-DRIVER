export function calculateDay({ gross=0, fuel=0, maintenance=0, depreciation=0, other=0, target=0 }) {
  const values = [gross, fuel, maintenance, depreciation, other, target].map(Number);
  const [g, f, m, d, o, t] = values.map(v => Number.isFinite(v) ? Math.max(0, v) : 0);
  const totalCosts = f + m + d + o;
  const net = Math.max(0, g - totalCosts);
  const remaining = Math.max(0, t - net);
  const progress = t > 0 ? Math.min(100, Math.max(0, (net / t) * 100)) : 0;
  return { totalCosts, net, remaining, progress };
}
