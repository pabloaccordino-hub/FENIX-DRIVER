function formatDuration(hours) {
  const totalMinutes = Math.max(0, Math.round(hours * 60));
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

export function getCopilotInsight({ net = 0, target = 0, hours = 0, historicalHourlyNet = 0 }) {
  if (target > 0 && net >= target) {
    return { tone: 'success', title: 'Objetivo alcanzado', message: 'Ya superaste tu objetivo neto. Podés finalizar la jornada.' };
  }

  const remaining = Math.max(0, target - net);
  const currentHourly = hours > 0 ? net / hours : 0;
  const hasHistory = historicalHourlyNet > 0 && currentHourly > 0;

  if (hasHistory && currentHourly < historicalHourlyNet * 0.7) {
    return { tone: 'warning', title: 'Tu rendimiento bajó', message: `Tu ritmo actual está bastante por debajo de tu promedio de ${Math.round(historicalHourlyNet).toLocaleString('es-AR')} $/h.` };
  }

  if (remaining > 0 && currentHourly > 0) {
    return { tone: 'positive', title: 'Vas bien', message: `Si mantenés este ritmo, alcanzarías tu objetivo en aproximadamente ${formatDuration(remaining / currentHourly)}.` };
  }

  return { tone: 'neutral', title: 'Copiloto en aprendizaje', message: 'Registrá más viajes para que Fénix pueda conocer tu ritmo y darte recomendaciones personalizadas.' };
}
