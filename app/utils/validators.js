const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const PHONE_REGEX = /^(\+63\d{10}|09\d{9})$/;
const MIN_CREDENTIAL_LENGTH = 8;
const UPPERCASE_REGEX = /[A-Z]/;
const LOWERCASE_REGEX = /[a-z]/;

export const isValidEmail = (value = '') => {
    return EMAIL_REGEX.test(String(value).toLowerCase());
};

export const hasMinCredentialLength = (value = '', minLength = MIN_CREDENTIAL_LENGTH) => {
    return String(value).trim().length >= minLength;
};

export const isPasswordSimilarToUsername = (username = '', password = '') => {
    return String(username).trim().toLowerCase() === String(password).trim().toLowerCase();
};

export const hasUppercaseCharacter = (value = '') => {
    return UPPERCASE_REGEX.test(String(value));
};

export const hasLowercaseCharacter = (value = '') => {
    return LOWERCASE_REGEX.test(String(value));
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