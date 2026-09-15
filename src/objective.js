function positive(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function planObjective({ targetNet = 0, currentNet = 0, currentGross = 0, currentHours = 0, currentKm = 0, costPerKm = 0 } = {}) {
  const target = positive(targetNet);
  const net = positive(currentNet);
  const gross = positive(currentGross);
  const hours = positive(currentHours);
  const km = positive(currentKm);
  const costKm = positive(costPerKm);
  const remainingNet = Math.max(0, target - net);

  if (remainingNet === 0) {
    return { remainingNet: 0, currentNetPerHour: hours ? net / hours : 0, estimatedHoursRemaining: 0, estimatedKmRemaining: 0, estimatedGrossRemaining: 0 };
  }

  const currentNetPerHour = hours > 0 ? net / hours : 0;
  const grossPerKm = km > 0 ? gross / km : 0;
  const netPerKm = Math.max(0, grossPerKm - costKm);

  return {
    remainingNet,
    currentNetPerHour,
    estimatedHoursRemaining: currentNetPerHour > 0 ? remainingNet / currentNetPerHour : null,
    estimatedKmRemaining: netPerKm > 0 ? remainingNet / netPerKm : null,
    estimatedGrossRemaining: netPerKm > 0 && grossPerKm > 0 ? (remainingNet / netPerKm) * grossPerKm : null
  };
}
