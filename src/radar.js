const WEEKDAYS = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];

function positive(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function safeDate(value) {
  const date = value instanceof Date ? value : new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function analyzeRadar(history = [], referenceDate = new Date()) {
  const today = safeDate(referenceDate) || new Date();
  const weekdayIndex = today.getDay();
  const weekday = WEEKDAYS[weekdayIndex];
  const rows = (Array.isArray(history) ? history : []).filter(row => {
    const date = safeDate(row.date);
    return date && date.getDay() === weekdayIndex && positive(row.hours) > 0 && positive(row.net) > 0;
  });

  const buckets = new Map();
  for (const row of rows) {
    const hour = Math.max(0, Math.min(23, Number(row.startHour) || 0));
    const current = buckets.get(hour) || { net: 0, hours: 0, km: 0, samples: 0 };
    current.net += positive(row.net);
    current.hours += positive(row.hours);
    current.km += positive(row.km);
    current.samples += 1;
    buckets.set(hour, current);
  }

  let bestStartHour = null;
  let bestHourlyNet = 0;
  let bestKmPerHour = 0;
  let samples = 0;
  for (const [hour, bucket] of buckets) {
    const hourlyNet = bucket.net / bucket.hours;
    if (hourlyNet > bestHourlyNet) {
      bestStartHour = hour;
      bestHourlyNet = hourlyNet;
      bestKmPerHour = bucket.km / bucket.hours;
      samples = bucket.samples;
    }
  }

  const confidence = samples >= 5 ? 'alta' : samples >= 2 ? 'media' : 'baja';
  return { weekday, weekdayIndex, bestStartHour, bestHourlyNet, bestKmPerHour, samples, confidence, analyzedJourneys: rows.length };
}

export function radarMessage(radar) {
  if (!radar || radar.bestStartHour === null) {
    return `Todavía no tengo suficientes datos de ${radar?.weekday || 'hoy'} para recomendar una ventana.`;
  }
  const hour = String(radar.bestStartHour).padStart(2, '0');
  const confidence = radar.confidence === 'alta' ? 'alta' : radar.confidence === 'media' ? 'media' : 'baja';
  return `Para los ${radar.weekday}, tu mejor inicio registrado es cerca de las ${hour}:00. Confianza ${confidence} con ${radar.samples} muestra${radar.samples === 1 ? '' : 's'}.`;
}
