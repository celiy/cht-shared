/**
 * The minimum length of a password
 * @type {number}
 */
export const PASSWORD_MIN_LENGTH = 8;

/**
 * The maximum length of a password
 * @type {number}
 */
export const PASSWORD_MAX_LENGTH = 128;

/**
 * Validate a password
 * @param {string} password The password to validate.
 * @returns {boolean} True if the password is valid.
 */
export default function validatePassword(password: string): boolean {
    if (typeof password !== 'string') {
        return false;
    }

    if (password.length < PASSWORD_MIN_LENGTH || password.length > PASSWORD_MAX_LENGTH) {
        return false;
    }

    return true;
}
