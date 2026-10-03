/**
 * Validate a phone number
 * @param {string} phone The phone number to validate.
 * @returns {boolean} True if the phone number is valid.
 */
export default function validatePhone(phone: string): boolean {
    const phoneRegex = /^\s*(\d{2}|\d{0})[-. ]?(\d{5}|\d{4})[-. ]?(\d{4})[-. ]?\s*$/;

    const isPhonevalid = phoneRegex.test(phone);

    return isPhonevalid;
}