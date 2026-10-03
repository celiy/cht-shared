/**
 * Validate an email
 * @param {string} email The email to validate.
 * @returns {boolean} True if the email is valid.
 */
export default function validateEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    const isValidEmail = emailRegex.test(email);

    return isValidEmail;
}