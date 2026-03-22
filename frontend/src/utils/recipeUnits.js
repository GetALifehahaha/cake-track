export const formatQty = (value) => {
    if (value === null || value === undefined || value === '') return '0';

    const parsed = Number(value);
    if (Number.isNaN(parsed)) return String(value);

    return parsed.toFixed(4).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
};

export const getBaseUnit = (ingredient) => {
    const units = ingredient?.ingredient_units || [];

    if (!units.length) {
        return {
            id: ingredient?.ingredient_unit_id,
            abbreviation: ingredient?.ingredient_unit,
            multiplier_to_base: 1,
        };
    }

    return units.find(unit => Number(unit.multiplier_to_base) === 1) || units[0];
};

export const toDisplayAmount = (baseAmount, unit) => {
    const multiplier = Number(unit?.multiplier_to_base || 1);
    if (!multiplier) return Number(baseAmount || 0);
    return Number(baseAmount || 0) / multiplier;
};

const scoreAmount = (value) => {
    const formatted = formatQty(value);
    const decimals = formatted.includes('.') ? formatted.split('.')[1].length : 0;
    const isWhole = decimals === 0;

    return {
        decimals,
        isWhole,
        value: Number(value),
        formatted,
    };
};

export const getBestDisplay = (ingredientRow) => {
    const units = ingredientRow?.ingredient_units || [];
    const baseUnit = getBaseUnit(ingredientRow);

    if (!units.length) {
        return {
            amount: Number(ingredientRow?.amount_needed || 0),
            unitLabel: ingredientRow?.ingredient_unit || '',
            baseAmount: Number(ingredientRow?.amount_needed || 0),
            baseUnitLabel: ingredientRow?.ingredient_unit || '',
            usedNonBase: false,
        };
    }

    const baseAmount = Number(ingredientRow?.amount_needed || 0);

    const candidates = units
        .map(unit => ({
            unit,
            amount: toDisplayAmount(baseAmount, unit),
        }))
        .filter(candidate => candidate.amount >= 0);

    const preferred = candidates
        .filter(candidate => candidate.amount >= 1)
        .sort((a, b) => {
            const aScore = scoreAmount(a.amount);
            const bScore = scoreAmount(b.amount);

            if (aScore.isWhole !== bScore.isWhole) return aScore.isWhole ? -1 : 1;
            if (aScore.decimals !== bScore.decimals) return aScore.decimals - bScore.decimals;
            return aScore.value - bScore.value;
        })[0] || candidates[0];

    const baseLabel = baseUnit?.abbreviation || baseUnit?.name || ingredientRow?.ingredient_unit || '';
    const preferredLabel = preferred?.unit?.abbreviation || preferred?.unit?.name || baseLabel;

    return {
        amount: preferred?.amount ?? baseAmount,
        unitLabel: preferredLabel,
        baseAmount,
        baseUnitLabel: baseLabel,
        usedNonBase: preferred?.unit?.id !== baseUnit?.id,
    };
};
