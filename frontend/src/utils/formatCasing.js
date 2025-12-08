export const formatCasing = (str) => {
    return str
        .replace(/_/g, " ")          // change underscores to spaces
        .toLowerCase()               // normalize casing
        .replace(/\b\w/g, c => c.toUpperCase()); // capitalize each word
}