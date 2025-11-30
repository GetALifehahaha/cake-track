// utils/capitalize.js (Your function)

export const capitalize = (str) => {
    // 1. Check if the input is a valid string, otherwise return an empty string
    if (typeof str !== 'string' || !str) {
        return '';
    }
    
    // 2. Perform capitalization only on valid strings
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};