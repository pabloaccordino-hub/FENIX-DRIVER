function positive(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function normalizeVehicle(input = {}) {
  return {
    fuelPrice: positive(input.fuelPrice),
    consumption: positive(input.consumption),
    maintenancePerKm: positive(input.maintenancePerKm),
    depreciationPerKm: positive(input.depreciationPerKm),
    monthlyFixedCosts: positive(input.monthlyFixedCosts)
  };
}

export function calculateVehicleCost(vehicleInput, km = 0, days = 1) {
  const vehicle = normalizeVehicle(vehicleInput);
  const distance = Math.max(0, Number(km) || 0);
  const dayCount = Math.max(0, Number(days) || 0);
  const fuelPerKm = vehicle.consumption > 0 ? vehicle.fuelPrice / vehicle.consumption : 0;
  const variablePerKm = fuelPerKm + vehicle.maintenancePerKm + vehicle.depreciationPerKm;
  const variable = distance * variablePerKm;
  const fixedDaily = (vehicle.monthlyFixedCosts / 30) * dayCount;
  const total = variable + fixedDaily;
  return { fuelPerKm, costPerKm: variablePerKm, variable, fixedDaily, total };
}

export function calculateEconomicDay({ gross=0, fuel=0, maintenance=0, other=0, km=0, vehicle={}, days=1 } = {}) {
  const v = normalizeVehicle(vehicle);
  const distance = Math.max(0, Number(km) || 0);
  const g = Math.max(0, Number(gross) || 0);
  const fuelActual = Math.max(0, Number(fuel) || 0);
  const maintenanceActual = Math.max(0, Number(maintenance) || 0);
  const otherActual = Math.max(0, Number(other) || 0);
  const fuelEstimate = distance * (v.consumption > 0 ? v.fuelPrice / v.consumption : 0);
  const fuelCost = fuelActual > 0 ? fuelActual : fuelEstimate;
  const maintenanceReserve = maintenanceActual > 0 ? maintenanceActual : distance * v.maintenancePerKm;
  const depreciationReserve = distance * v.depreciationPerKm;
  const fixedReserve = (v.monthlyFixedCosts / 30) * Math.max(0, Number(days) || 0);
  const totalEconomicCost = fuelCost + maintenanceReserve + depreciationReserve + fixedReserve + otherActual;
  return { fuelCost, maintenanceReserve, depreciationReserve, fixedReserve, otherActual, totalEconomicCost, economicNet: Math.max(0, g - totalEconomicCost) };
}
