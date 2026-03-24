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
