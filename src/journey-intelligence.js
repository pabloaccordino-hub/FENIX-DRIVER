const n = value => Number.isFinite(Number(value)) ? Number(value) : 0;

export function evaluateLiveJourney({ currentNet = 0, hours = 0, historicalHourlyNet = 0, targetNet = 0, samples = 0 } = {}) {
  const net = Math.max(0, n(currentNet));
  const elapsed = Math.max(0, n(hours));
  const historyRate = Math.max(0, n(historicalHourlyNet));
  const target = Math.max(0, n(targetNet));
  const evidence = Math.max(0, n(samples));
  const remainingNet = Math.max(0, target - net);
  const currentHourlyNet = elapsed > 0 ? net / elapsed : 0;

  if (target > 0 && net >= target) {
    return { status: 'OBJETIVO ALCANZADO', tone: 'fire', currentHourlyNet, remainingNet: 0, projectedHoursRemaining: 0, benchmarkHourlyNet: historyRate };
  }
  if (evidence < 2 || historyRate <= 0) {
    return { status: 'APRENDIENDO', tone: 'muted', currentHourlyNet, remainingNet, projectedHoursRemaining: null, benchmarkHourlyNet: historyRate };
  }
  const performanceRatio = currentHourlyNet > 0 ? currentHourlyNet / historyRate : 0;
  const status = performanceRatio < 0.75 ? 'RITMO BAJO' : 'EN MARCHA';
  const tone = status === 'RITMO BAJO' ? 'amber' : 'green';
  return {
    status,
    tone,
    currentHourlyNet,
    remainingNet,
    projectedHoursRemaining: remainingNet > 0 ? remainingNet / historyRate : 0,
    benchmarkHourlyNet: historyRate,
    performanceRatio,
  };
}

export function liveJourneyMessage(result) {
  if (!result) return 'Fénix está analizando tu jornada.';
  if (result.status === 'OBJETIVO ALCANZADO') return 'Ya cubriste tu objetivo neto. Podés finalizar la jornada o continuar por decisión propia.';
  if (result.status === 'APRENDIENDO') return 'Fénix todavía necesita más jornadas para comparar tu rendimiento en tiempo real.';
  if (result.status === 'RITMO BAJO') return 'Tu ritmo actual está por debajo de tu rendimiento histórico. Fénix recomienda revisar si conviene continuar ahora.';
  return result.projectedHoursRemaining > 0
    ? `Tu jornada mantiene un ritmo compatible con tu historial. Al ritmo de referencia, faltan aproximadamente ${Math.round(result.projectedHoursRemaining * 10) / 10} h para el objetivo.`
    : 'Tu jornada mantiene un ritmo compatible con tu historial.';
}
