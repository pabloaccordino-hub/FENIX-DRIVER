function positive(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function recordJourney(history = [], journey = {}) {
  const entry = {
    date: String(journey.date || new Date().toISOString().slice(0, 10)),
    platform: String(journey.platform || 'General'),
    net: positive(journey.net),
    hours: positive(journey.hours),
    km: positive(journey.km),
    startHour: Math.max(0, Math.min(23, Number(journey.startHour) || 0))
  };
  return [...history, entry];
}

export function summarizeHistory(history = []) {
  const rows = Array.isArray(history) ? history : [];
  const journeys = rows.length;
  const totalNet = rows.reduce((sum, row) => sum + positive(row.net), 0);
  const totalHours = rows.reduce((sum, row) => sum + positive(row.hours), 0);
  const totalKm = rows.reduce((sum, row) => sum + positive(row.km), 0);
  return {
    journeys,
    totalNet,
    totalHours,
    totalKm,
    averageHourlyNet: totalHours ? totalNet / totalHours : 0,
    averageKmPerHour: totalHours ? totalKm / totalHours : 0
  };
}

export function recommendWorkWindow(history = []) {
  const rows = Array.isArray(history) ? history : [];
  const buckets = new Map();
  for (const row of rows) {
    const hour = Math.max(0, Math.min(23, Number(row.startHour) || 0));
    const hours = positive(row.hours);
    if (!hours) continue;
    const current = buckets.get(hour) || { net: 0, hours: 0, samples: 0 };
    current.net += positive(row.net);
    current.hours += hours;
    current.samples += 1;
    buckets.set(hour, current);
  }
  let bestStartHour = null;
  let bestHourlyNet = 0;
  let bestSamples = 0;
  for (const [hour, bucket] of buckets) {
    const rate = bucket.net / bucket.hours;
    if (rate > bestHourlyNet) {
      bestStartHour = hour;
      bestHourlyNet = rate;
      bestSamples = bucket.samples;
    }
  }
  const confidence = bestSamples >= 5 ? 'alta' : bestSamples >= 2 ? 'media' : 'baja';
  return { bestStartHour, bestHourlyNet, confidence, samples: bestSamples };
}

export function recommendPlatform(history = []) {
  const buckets = new Map();
  for (const row of Array.isArray(history) ? history : []) {
    const platform = String(row.platform || 'General');
    const hours = positive(row.hours);
    if (!hours) continue;
    const current = buckets.get(platform) || { net: 0, hours: 0 };
    current.net += positive(row.net);
    current.hours += hours;
    buckets.set(platform, current);
  }
  let best = { platform: null, hourlyNet: 0 };
  for (const [platform, bucket] of buckets) {
    const hourlyNet = bucket.net / bucket.hours;
    if (hourlyNet > best.hourlyNet) best = { platform, hourlyNet };
  }
  return best;
}
