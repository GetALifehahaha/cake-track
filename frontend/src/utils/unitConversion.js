/**
 * Unit conversion utilities for recipe ingredients.
 *
 * Storage units (what the DB uses) are "big" units like kg, L.
 * Sub-units are the smaller, friendlier alternatives like g, mL.
 *
 * In recipe forms the user can pick either the storage unit or
 * the sub-unit per ingredient row. On save everything is converted
 * back to the storage unit before hitting the API.
 */

// Maps a storage-unit abbreviation → its sub-unit counterpart
const SUB_UNIT_MAP = {
  kg:  { sub: 'g',  factor: 1000 },
  L:   { sub: 'mL', factor: 1000 },
};

// Reverse lookup: sub-unit abbreviation → storage unit info
const PARENT_UNIT_MAP = Object.entries(SUB_UNIT_MAP).reduce((acc, [parent, { sub, factor }]) => {
  acc[sub] = { parent, factor };
  return acc;
}, {});

/**
 * Given a storage-unit abbreviation, return the list of unit
 * options the user can pick from in a recipe ingredient row.
 *
 * Example: getUnitOptions('kg') → [{ label: 'kg', value: 'kg' }, { label: 'g', value: 'g' }]
 * For a unit with no sub-unit (e.g. 'pcs') it returns just that unit.
 */
export function getUnitOptions(storageUnit) {
  const entry = SUB_UNIT_MAP[storageUnit];
  if (!entry) return [{ label: storageUnit, value: storageUnit }];
  return [
    { label: storageUnit, value: storageUnit },
    { label: entry.sub,   value: entry.sub },
  ];
}

/**
 * Return the friendliest default unit for a given storage unit.
 * e.g. 'kg' → 'g', 'L' → 'mL', 'pcs' → 'pcs'
 */
export function getDefaultRecipeUnit(storageUnit) {
  return SUB_UNIT_MAP[storageUnit]?.sub ?? storageUnit;
}

/**
 * Convert a value FROM the chosen display unit TO the storage unit.
 * e.g. toStorageUnit(200, 'g')  → 0.2   (storage = kg)
 *      toStorageUnit(5,   'kg') → 5     (already storage)
 */
export function toStorageUnit(value, displayUnit) {
  const parent = PARENT_UNIT_MAP[displayUnit];
  if (!parent) return Number(value); // already in storage unit
  return Number(value) / parent.factor;
}

/**
 * Convert a value FROM the storage unit TO the chosen display unit.
 * e.g. fromStorageUnit(0.2, 'g')  → 200
 *      fromStorageUnit(5,   'kg') → 5
 */
export function fromStorageUnit(value, displayUnit) {
  const parent = PARENT_UNIT_MAP[displayUnit];
  if (!parent) return Number(value); // already in display unit
  return Number(value) * parent.factor;
}

/**
 * Determine the best display unit + value for a given storage value.
 * Prefers the sub-unit when the result is a clean integer (≥1).
 *
 * e.g. smartDisplay(0.2, 'kg') → { value: 200, unit: 'g' }
 *      smartDisplay(2,   'kg') → { value: 2,   unit: 'kg' }
 */
export function smartDisplay(storageValue, storageUnit) {
  const entry = SUB_UNIT_MAP[storageUnit];
  if (!entry) return { value: Number(storageValue), unit: storageUnit };

  const subValue = Number(storageValue) * entry.factor;
  // Prefer sub-unit when the converted value >= 1 and is a clean number
  if (subValue >= 1 && Number.isInteger(subValue)) {
    return { value: subValue, unit: entry.sub };
  }
  // Also prefer sub-unit when storage value is a messy decimal
  if (Number(storageValue) % 1 !== 0) {
    return { value: parseFloat(subValue.toFixed(2)), unit: entry.sub };
  }
  return { value: Number(storageValue), unit: storageUnit };
}
