export default function validatePhone(phone: string) {
    const phoneRegex = /^\s*(\d{2}|\d{0})[-. ]?(\d{5}|\d{4})[-. ]?(\d{4})[-. ]?\s*$/;

    const isPhonevalid = phoneRegex.test(phone);

    return isPhonevalid;
}