import type { FoodCategory, FoodUnit, ImpactMetrics } from '@/types';

// Based on published lifecycle assessment data (kg CO2e per kg food, liters water per kg)
const IMPACT_FACTORS: Record<string, { co2PerKg: number; waterPerKg: number }> = {
  Produce:        { co2PerKg: 0.4,   waterPerKg: 322   },
  Meat:           { co2PerKg: 13.3,  waterPerKg: 15400 },
  Dairy:          { co2PerKg: 3.2,   waterPerKg: 1020  },
  Bakery:         { co2PerKg: 0.9,   waterPerKg: 1608  },
  'Cooked Meals': { co2PerKg: 2.5,   waterPerKg: 680   },
  Beverages:      { co2PerKg: 0.3,   waterPerKg: 210   },
  Other:          { co2PerKg: 1.0,   waterPerKg: 500   },
};

// Convert any unit to approximate kg
const TO_KG: Record<FoodUnit, number> = {
  kg:       1,
  lbs:      0.453592,
  portions: 0.35,
  liters:   1,
  pieces:   0.15,
  loaves:   0.45,
};

export function computeImpact(
  category: FoodCategory | string,
  quantity: number,
  unit: FoodUnit | string
): ImpactMetrics {
  const factor = IMPACT_FACTORS[category] ?? IMPACT_FACTORS['Other'];
  const kgMultiplier = TO_KG[unit as FoodUnit] ?? 1;
  const kg = quantity * kgMultiplier;

  return {
    co2:   parseFloat((kg * factor.co2PerKg).toFixed(2)),
    water: Math.round(kg * factor.waterPerKg),
    meals: Math.floor(kg / 0.35), // ~350g per meal
  };
}

// Format CO2 in human-readable form
export function formatCO2(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)}t`;
  return `${kg.toFixed(1)}kg`;
}

// Format water in human-readable form
export function formatWater(liters: number): string {
  if (liters >= 1_000_000) return `${(liters / 1_000_000).toFixed(1)}ML`;
  if (liters >= 1000) return `${(liters / 1000).toFixed(1)}k L`;
  return `${liters}L`;
}

// Real-world equivalences for impact page
export function getEquivalences(co2Kg: number, waterLiters: number) {
  return {
    treesEquivalent:  Math.round(co2Kg / 21),          // avg tree absorbs ~21kg CO2/year
    showersEquivalent: Math.round(waterLiters / 65),    // avg shower = 65L
    carKmEquivalent:   Math.round(co2Kg / 0.21),        // avg car = 0.21kg CO2/km
    flightsEquivalent: parseFloat((co2Kg / 255).toFixed(2)), // LHR-NYC ~255kg CO2
  };
}
