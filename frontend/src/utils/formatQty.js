export const formatQty = (value) => {
    if (value === null || value === undefined || value === '') return '0';

    const parsed = Number(value);
    if (Number.isNaN(parsed)) return String(value);

    return parsed.toFixed(4).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
};
