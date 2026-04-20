export interface FormField {
    id: string;
    label: string;
    type: 'text' | 'email' | 'phone' | 'cpf' | 'cnpj' | 'cep' | 'password' | 'number' | 'date' | 'textarea' | 'checkbox' | 'radio' | 'select';
    section?: string;
    group?: string;
    name?: string;
    placeholder?: string;
    /** Exibe ação de copiar (não combina com `type: 'password'`, que usa alternar visibilidade). */
    copiable?: boolean;
    helperText?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    variant?: string;
    /** Apenas para `type: 'checkbox'`: visual de caixa ou switch. */
    checkboxStyle?: 'normal' | 'switch';
    maxSize?: number;
    minSize?: number;
    inputClass?: object | string;
    textMask?: string;
    description?: string;
    checked?: boolean;
    value?: any;
    options?: {
        label: string;
        value: string;
        description?: string;
    }[];
    cols?: number;
    condition?: {
        field: string;
        value: any;
        operator?: 'eq' | 'neq';
    };
}