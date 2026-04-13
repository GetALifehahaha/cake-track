export const extractApiErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
    const data = error?.response?.data;

    if (!data) return fallback;
    if (typeof data === 'string') return data;

    if (typeof data.error === 'string' && data.error.trim()) {
        return data.error;
    }

    if (Array.isArray(data.non_field_errors) && data.non_field_errors.length > 0) {
        return String(data.non_field_errors[0]);
    }

    for (const value of Object.values(data)) {
        if (Array.isArray(value) && value.length > 0) {
            return String(value[0]);
        }

        if (typeof value === 'string' && value.trim()) {
            return value;
        }
    }

    return fallback;
};
