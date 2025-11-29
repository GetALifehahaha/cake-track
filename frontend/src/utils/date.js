export const formatDateForAPI = (date) => {
    if (!date) return null;
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
};

export const formatDateForDisplay = (dateTimeString) => {
    if (!dateTimeString) return null;
    
    const date = new Date(dateTimeString);

    if (isNaN(date.getTime())) {
        console.error("Invalid date string provided:", dateTimeString);
        return null;
    }

    return date.toISOString().slice(0, 10);
};