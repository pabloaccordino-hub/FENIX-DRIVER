const clamp = (value, min = 0, max = 100) => Math.min(max, Math.max(min, value));
const ratioScore = (value, baseline) => baseline > 0 ? clamp((value / baseline) * 100) : null;

export function calculateFenixScore(input = {}) {
  const samples = Number(input.evidenceSamples) || 0;
  if (samples < 2) return { score: null, confidence: 'Aprendiendo', components: {} };

  const historical = Number(input.historicalHourlyNet) || 0;
  const expected = Number(input.expectedHourlyNet) || historical;
  const current = Number(input.currentHourlyNet) || historical;
  const contextMax = Number(input.contextMaxScore) || 0;
  const context = Number(input.contextScore) || 0;
  const platformAdvantage = Number(input.platformAdvantage) || 0;
  const targetProgress = clamp((Number(input.targetProgress) || 0) * 100);
  const cost = Number(input.vehicleCostPerKm) || 0;
  const benchmarkCost = Number(input.benchmarkCostPerKm) || 0;

  const components = {
    expected: historical > 0 ? ratioScore(expected, historical) : 50,
    current: historical > 0 ? ratioScore(current, historical) : 50,
    context: contextMax > 0 ? clamp((context / contextMax) * 100) : 50,
    platform: clamp(50 + platformAdvantage * 50),
    target: targetProgress,
    vehicle: benchmarkCost > 0 && cost > 0 ? clamp((benchmarkCost / cost) * 100) : 50
  };

  const weighted = components.expected * 0.25 + components.current * 0.20 + components.context * 0.15 + components.platform * 0.15 + components.target * 0.10 + components.vehicle * 0.15;
  const score = Math.round(clamp(weighted));
  const confidence = samples >= 8 ? 'Alta' : samples >= 3 ? 'Media' : 'Baja';
  return { score, confidence, components };
}

export function scoreLabel(score) {
  if (score === null || score === undefined) return 'APRENDIENDO';
  if (score >= 80) return 'OPORTUNIDAD FUERTE';
  if (score >= 60) return 'OPORTUNIDAD FAVORABLE';
  if (score >= 40) return 'OPORTUNIDAD MODERADA';
  return 'OPORTUNIDAD DÉBIL';
}

export function scoreTone(score) {
  if (score === null || score === undefined) return 'muted';
  if (score >= 80) return 'strong';
  if (score >= 60) return 'positive';
  if (score >= 40) return 'warning';
  return 'negative';
}
