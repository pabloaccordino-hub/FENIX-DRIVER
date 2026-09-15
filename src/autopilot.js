const clean = value => String(value ?? '').trim().toUpperCase();

const PRIORITY = {
  'TERMINÁ': ['alta', 'fire'],
  'CAMBIÁ DE PLATAFORMA': ['alta', 'purple'],
  'CAMBIÁ DE ZONA': ['media', 'amber'],
  'ESPERÁ': ['media', 'amber'],
  'SALÍ': ['media', 'green'],
  'CONTINUÁ': ['baja', 'green'],
  'APRENDIENDO': ['baja', 'muted']
};

export function evaluateAutopilot({ active = false, action = '', previousAction = null, score = null, liveStatus = '' } = {}) {
  const current = clean(action) || 'APRENDIENDO';
  const previous = previousAction === null || previousAction === undefined ? null : clean(previousAction);
  if (!active) return { status: 'INACTIVO', changed: false, alert: false, priority: 'baja', tone: 'muted', message: 'Iniciá la jornada para activar el centro de mando de Fénix.' };

  const changed = previous !== null && previous !== current;
  const [priority, tone] = PRIORITY[current] || ['baja', 'muted'];
  const alert = changed;
  const scoreText = Number.isFinite(Number(score)) ? ` Score ${Math.round(Number(score))}/100.` : '';
  const liveText = clean(liveStatus) === 'RITMO BAJO' ? ' El ritmo actual requiere atención.' : '';
  const message = changed
    ? `Fénix cambió la recomendación a ${current}.${scoreText}${liveText}`
    : `Fénix mantiene ${current}.${scoreText}${liveText}`;

  return { status: alert ? 'ALERTA' : 'EN MARCHA', changed, alert, priority, tone, action: current, message };
}
