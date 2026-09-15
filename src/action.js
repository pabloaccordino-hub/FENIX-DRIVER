const positive = value => Number.isFinite(Number(value)) && Number(value) > 0 ? Number(value) : 0;
const clean = value => String(value ?? '').trim();
const hourLabel = hour => hour === null || hour === undefined ? null : `${String(Math.round(Number(hour))).padStart(2, '0')}:00`;
const moneyNumber = value => Math.round(Math.max(0, Number(value) || 0)).toLocaleString('es-AR');

/**
 * Converts Fénix's analytical signals into one concrete next action.
 * It never invents a location/platform when the strategy lacks evidence.
 */
export function recommendAction({
  targetNet = 0,
  currentNet = 0,
  active = false,
  score = null,
  strategy = {},
  live = {},
  currentPlatform = '',
} = {}) {
  const target = positive(targetNet);
  const net = Math.max(0, Number(currentNet) || 0);
  const remaining = Math.max(0, target - net);
  const numericScore = Number.isFinite(Number(score)) ? Number(score) : null;
  const strategyAction = clean(strategy.action).toUpperCase();
  const zone = clean(strategy.zone) || null;
  const platform = clean(strategy.platform) || null;
  const startHour = strategy.startHour === null || strategy.startHour === undefined ? null : Number(strategy.startHour);
  const expectedRate = positive(strategy.expectedHourlyNet);

  if (target > 0 && net >= target) {
    return {
      action: 'TERMINÁ', tone: 'fire', reason: `Ya alcanzaste tu objetivo neto de $${moneyNumber(target)}.`,
      nextStep: 'Cerrá la jornada o continuá solamente si tenés otro objetivo.', zone: null, platform: null, startHour: null
    };
  }

  if (active && clean(live.status).toUpperCase() === 'RITMO BAJO') {
    return {
      action: 'ESPERÁ', tone: 'amber',
      reason: 'Tu ritmo actual está bajo respecto de las señales disponibles; no conviene forzar la jornada en este momento.',
      nextStep: 'Esperá una mejora del contexto y reevaluá Fénix antes de volver a tomar viajes.', zone, platform, startHour
    };
  }

  if (active && strategyAction === 'CAMBIÁ DE PLATAFORMA' && platform && platform.toLowerCase() !== clean(currentPlatform).toLowerCase()) {
    return {
      action: 'CAMBIÁ DE PLATAFORMA', tone: 'purple',
      reason: `Fénix detecta una ventaja histórica para ${platform} en esta combinación de condiciones.`,
      nextStep: `Probá ${platform} y reevaluá el rendimiento después de algunos viajes.`, zone, platform, startHour
    };
  }

  if (active && strategyAction === 'CAMBIÁ DE ZONA' && zone) {
    return {
      action: 'CAMBIÁ DE ZONA', tone: 'amber',
      reason: `Tu historial muestra una ventaja para ${zone} en esta ventana.`,
      nextStep: `Considerá desplazarte hacia ${zone} y reevaluá después de algunos viajes.`, zone, platform, startHour
    };
  }

  if (active) {
    const eta = positive(live.projectedHoursRemaining) || (expectedRate > 0 && remaining > 0 ? remaining / expectedRate : 0);
    return {
      action: 'CONTINUÁ', tone: 'green',
      reason: remaining > 0 ? `Tu rendimiento actual permite seguir buscando el objetivo. Te faltan $${moneyNumber(remaining)} netos.` : 'Tu jornada mantiene un rendimiento compatible con las señales disponibles.',
      nextStep: remaining > 0 ? `Continuá; faltan $${moneyNumber(remaining)} netos${eta > 0 ? ` y aproximadamente ${eta.toFixed(1)} h al ritmo proyectado` : ''}.` : 'Mantené el ritmo y reevaluá periódicamente.',
      zone, platform, startHour
    };
  }

  if (numericScore !== null && numericScore < 40) {
    return {
      action: 'ESPERÁ', tone: 'amber',
      reason: 'La oportunidad actual es débil según la evidencia disponible.',
      nextStep: 'Esperá una ventana con mejores señales y volvé a consultar Fénix.', zone: null, platform: null, startHour: null
    };
  }

  if (strategyAction === 'APRENDIENDO' || numericScore === null) {
    return {
      action: 'ESPERÁ', tone: 'amber',
      reason: 'Fénix todavía no tiene evidencia suficiente para recomendar una salida concreta.',
      nextStep: 'Esperá a acumular más jornadas o registrá nuevos datos para que Fénix pueda aprender.', zone: null, platform: null, startHour: null
    };
  }

  return {
    action: 'SALÍ', tone: 'green',
    reason: zone && platform && startHour !== null
      ? `La mejor combinación disponible es ${zone} con ${platform} cerca de las ${hourLabel(startHour)}.`
      : 'Las señales disponibles son favorables para intentar la jornada.',
    nextStep: zone && platform && startHour !== null
      ? `Salí cerca de las ${hourLabel(startHour)}, priorizá ${zone} y comenzá con ${platform}.`
      : 'Iniciá la jornada y dejá que Fénix reevalúe el contexto con los primeros datos.',
    zone, platform, startHour
  };
}

export function actionMessage(result) {
  return result?.nextStep || result?.reason || 'Fénix está analizando tu próxima acción.';
}
