const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const PHONE_REGEX = /^(\+63\d{10}|09\d{9})$/;

export const isValidEmail = (value = '') => {
    return EMAIL_REGEX.test(String(value).toLowerCase());
};

export const normalizePhoneNumber = (value = '') => {
    return String(value).replace(/[\s-]/g, '').trim();
};

export const isValidPHPhoneNumber = (value = '') => {
    return PHONE_REGEX.test(normalizePhoneNumber(value));
};

export const formatPhoneNumber = (text) => {
    const digits = text.replace(/\D/g, "").slice(0, 14)

    if (digits.length <= 4) return digits

    if (digits.length <= 7) return digits.slice(0, 4) + " " + digits.slice(4);

    return (
        digits.slice(0, 4) +
        " " +
        digits.slice(4, 7) +
        " " +
        digits.slice(7)
    );
}