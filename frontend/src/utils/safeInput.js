/**
 * 
 * @param {e} e Input from e, make sure it is raw
 * @param {int} maxLength The maximum length of the input field
 * @returns Returns a string if the current length of e is less than the max length
 */
export const inputText = (e, maxLength=50) => {

    if (e.target.value.length > maxLength) return

    return e.target.value
}

/**
 * 
 * @param {e} e Input from e, make sure it is raw
 * @param {int} maxLength The maximum length of the input field
 * @returns Returns an number if the input is a valid number or if e is less than the max length
 */
export const inputNumber = (e, maxLength=11, maxAmount=null) => {
    console.log(maxLength, maxAmount)

    const raw = e.target.value

    if (!/^\d*\.?\d{0,2}$/.test(raw)) return

    if (e.target.value.length > maxLength) return;

    if (raw > Number.parseFloat(maxAmount)) return;

    return raw
}

export const limitedInput = (e, options = {}) => {
    const { maxLength = 50, isNumber = false } = options;
    const value = e.target.value;

    if (value.length > maxLength) return;

    if (isNumber && !/^\d*$/.test(value)) return;

    return value;
}