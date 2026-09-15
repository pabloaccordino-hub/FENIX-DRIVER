const positive = value => Number.isFinite(Number(value)) && Number(value) > 0 ? Number(value) : 0;

/**
 * Combina objetivo, rendimiento actual/histórico, Radar y Multi-App en una
 * única recomendación. No decide cuando la evidencia es insuficiente.
 */
export function decideNextAction({
  targetNet = 0,
  currentNet = 0,
  active = false,
  historicalHourlyNet = 0,
  radarRate = 0,
  predictiveHours = null,
  samples = 0,
  currentPlatform = null,
  bestPlatform = null,
  currentPlatformHourlyNet = 0,
  currentHourlyNet = 0,
  bestPlatformHourlyNet = 0,
} = {}) {
  const target = positive(targetNet);
  const net = Math.max(0, Number(currentNet) || 0);
  const historyRate = positive(historicalHourlyNet);
  const radar = positive(radarRate);
  const currentRate = positive(currentPlatformHourlyNet) || positive(currentHourlyNet);
  const bestRate = positive(bestPlatformHourlyNet);
  const evidence = Math.max(0, Number(samples) || 0);
  const remaining = Math.max(0, target - net);

  if (target > 0 && net >= target) {
    return { action: 'TERMINÁ', tone: 'fire', reason: 'Ya cubriste tu objetivo neto. Seguir trabajando es una decisión opcional, no una necesidad.' };
  }

  if (evidence < 2 || (historyRate <= 0 && radar <= 0)) {
    return { action: 'APRENDIENDO', tone: 'muted', reason: 'Fénix todavía no tiene suficiente evidencia para darte una orden confiable.' };
  }

  if (active && currentPlatform && bestPlatform && bestPlatform !== currentPlatform && bestRate >= currentRate * 1.35 && bestRate - currentRate >= 1500) {
    return { action: 'CAMBIÁ DE PLATAFORMA', tone: 'purple', reason: `${bestPlatform} muestra un rendimiento histórico claramente superior al de ${currentPlatform}.` };
  }

  const benchmark = radar || historyRate;
  if (active && currentRate > 0 && historyRate > 0 && currentRate < historyRate * 0.55 && evidence >= 3) {
    return { action: 'ESPERÁ', tone: 'amber', reason: 'Tu ritmo actual está muy por debajo de tu rendimiento histórico. Fénix recomienda no forzar la jornada en este momento.' };
  }

  if (active) {
    return { action: 'CONTINUÁ', tone: 'green', reason: predictiveHours != null && remaining > 0 ? `Tu rendimiento y tu objetivo siguen siendo compatibles. Faltan aproximadamente ${Math.round(predictiveHours * 10) / 10} h al ritmo previsto.` : 'Tu rendimiento actual sigue justificando continuar con la jornada.' };
  }

  if (benchmark > 0 && predictiveHours != null && predictiveHours > 0) {
    return { action: 'SALÍ', tone: 'green', reason: `Hay evidencia suficiente para proyectar tu objetivo. A tu ritmo esperado, necesitarías aproximadamente ${Math.round(predictiveHours * 10) / 10} h.` };
  }

  return { action: 'SALÍ', tone: 'green', reason: 'Tu historial muestra un rendimiento suficiente para intentar alcanzar el objetivo.' };
}

export function decisionMessage(result) {
  if (!result) return 'Fénix está analizando tus datos.';
  return result.reason;
}
