export const sortDirectionOptions = [
    { key: 'Ascending', value: 'asc' },
    { key: 'Descending', value: 'desc' },
];

export const parseOrderingParam = (ordering) => {
    const rawOrdering = String(ordering || '').trim();
    if (!rawOrdering) {
        return { sortField: null, sortDirection: 'asc' };
    }

    const fields = rawOrdering
        .split(',')
        .map((field) => field.trim())
        .filter(Boolean);

    if (fields.length === 0) {
        return { sortField: null, sortDirection: 'asc' };
    }

    const sortDirection = fields[0].startsWith('-') ? 'desc' : 'asc';
    const sortField = fields
        .map((field) => (field.startsWith('-') ? field.slice(1) : field))
        .join(',');

    return { sortField, sortDirection };
};

export const buildOrderingParam = (sortField, sortDirection = 'asc') => {
    if (!sortField) {
        return null;
    }

    const fields = String(sortField)
        .split(',')
        .map((field) => field.trim())
        .filter(Boolean);

    if (fields.length === 0) {
        return null;
    }

    if (sortDirection === 'desc') {
        return fields.map((field) => `-${field}`).join(',');
    }

    return fields.join(',');
};
