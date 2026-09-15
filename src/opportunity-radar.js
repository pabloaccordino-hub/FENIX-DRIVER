const WEEKDAYS = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
const n = v => Number.isFinite(Number(v)) ? Number(v) : 0;

function dateOf(v) {
  const d = v instanceof Date ? v : new Date(`${v}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function hourDistance(a, b) {
  const raw = Math.abs(a - b);
  return Math.min(raw, 24 - raw);
}

export function analyzeOpportunityRadar(history = [], { date = new Date(), hour = new Date().getHours() } = {}) {
  const d = dateOf(date) || new Date();
  const weekday = d.getDay();
  const targetHour = Math.max(0, Math.min(23, n(hour)));
  const rows = (Array.isArray(history) ? history : []).filter(r => {
    const rd = dateOf(r.date);
    return rd && rd.getDay() === weekday && String(r.zone || '').trim() && n(r.hours) > 0 && n(r.net) > 0;
  });

  const exact = rows.filter(r => hourDistance(n(r.startHour), targetHour) === 0);
  const near = rows.filter(r => hourDistance(n(r.startHour), targetHour) <= 2);
  const sourceRows = exact.length >= 2 ? exact : near;
  const source = exact.length >= 2 ? 'exact-hour' : near.length ? 'nearby-hour' : 'insufficient';
  const buckets = new Map();
  for (const row of sourceRows) {
    const zone = String(row.zone).trim();
    const b = buckets.get(zone) || { net:0, hours:0, km:0, samples:0 };
    b.net += Math.max(0, n(row.net)); b.hours += Math.max(0, n(row.hours)); b.km += Math.max(0, n(row.km)); b.samples += 1;
    buckets.set(zone, b);
  }
  const ranking = [...buckets.entries()].map(([zone,b]) => ({ zone, hourlyNet:b.hours ? b.net/b.hours : 0, kmPerHour:b.hours ? b.km/b.hours : 0, samples:b.samples }))
    .sort((a,b) => b.hourlyNet-a.hourlyNet || b.samples-a.samples);
  const best = ranking[0] || null;
  const confidence = !best ? 'baja' : best.samples >= 5 ? 'alta' : best.samples >= 2 ? 'media' : 'baja';
  return { weekday: WEEKDAYS[weekday], weekdayIndex: weekday, targetHour, bestZone: best?.zone || null, bestHourlyNet: best?.hourlyNet || 0, samples: best?.samples || 0, confidence, source, ranking };
}

export function opportunityMessage(result) {
  if (!result || !result.bestZone) return `Fénix todavía no tiene suficientes datos para recomendar una zona para ${result?.weekday || 'hoy'}.`;
  const h = String(result.targetHour).padStart(2,'0');
  const qualifier = result.source === 'exact-hour' ? 'a esta hora' : 'en una ventana cercana';
  return `Para ${result.weekday}, cerca de las ${h}:00, tu mejor zona registrada es ${result.bestZone} ${qualifier}, con ${Math.round(result.bestHourlyNet)}/h netos y ${result.samples} muestra${result.samples === 1 ? '' : 's'}.`;
}
