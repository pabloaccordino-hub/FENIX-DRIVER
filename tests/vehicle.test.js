import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateVehicleCost, normalizeVehicle, calculateEconomicDay } from '../src/vehicle.js';

test('calcula costo variable por km de combustible, mantenimiento y desgaste', () => {
  const vehicle = normalizeVehicle({ fuelPrice: 1500, consumption: 10, maintenancePerKm: 18, depreciationPerKm: 12 });
  assert.equal(calculateVehicleCost(vehicle, 100).total, 18000);
});

test('calcula costo fijo diario prorrateado y costo total de jornada', () => {
  const vehicle = normalizeVehicle({ fuelPrice: 1500, consumption: 10, maintenancePerKm: 18, depreciationPerKm: 12, monthlyFixedCosts: 90000 });
  const result = calculateVehicleCost(vehicle, 100, 1);
  assert.equal(result.variable, 18000);
  assert.equal(result.fixedDaily, 3000);
  assert.equal(result.total, 21000);
  assert.equal(result.costPerKm, 180);
});

test('corrige datos inválidos y evita costos negativos', () => {
  const vehicle = normalizeVehicle({ fuelPrice: -10, consumption: 0, maintenancePerKm: -5, depreciationPerKm: NaN, monthlyFixedCosts: -1 });
  const result = calculateVehicleCost(vehicle, 100, 1);
  assert.equal(result.total, 0);
});

test('calcula ganancia económica descontando reservas del vehículo y gastos reales', () => {
  const vehicle = normalizeVehicle({ fuelPrice: 1500, consumption: 10, maintenancePerKm: 18, depreciationPerKm: 12, monthlyFixedCosts: 90000 });
  const cost = calculateVehicleCost(vehicle, 100, 1);
  const economicNet = 100000 - 20000 - cost.total;
  assert.equal(economicNet, 59000);
});

test('usa gastos reales cuando existen y estima reservas faltantes', () => {
  const vehicle = normalizeVehicle({ fuelPrice: 1500, consumption: 10, maintenancePerKm: 18, depreciationPerKm: 12, monthlyFixedCosts: 90000 });
  const result = calculateEconomicDay({ gross: 100000, fuel: 20000, maintenance: 0, other: 5000, km: 100, vehicle, days: 1 });
  assert.equal(result.fuelCost, 20000);
  assert.equal(result.maintenanceReserve, 1800);
  assert.equal(result.depreciationReserve, 1200);
  assert.equal(result.fixedReserve, 3000);
  assert.equal(result.economicNet, 69000);
});
