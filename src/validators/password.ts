export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

export default function validatePassword(password: string): boolean {
    if (typeof password !== 'string') {
        return false;
    }

    if (password.length < PASSWORD_MIN_LENGTH || password.length > PASSWORD_MAX_LENGTH) {
        return false;
    }

    return true;
}
