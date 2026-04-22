/**
 * Tipos unificados da entidade User. Consumidos pelo backend (Drizzle + controllers)
 * e pelo front-end (páginas/forms), garantindo que os nomes dos campos batem em
 * ambos os lados — o que permite erros por campo no mesmo shape.
 */

export interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    createdAt: Date;
}

/** Representação pública: nunca sai o hash da senha no JSON. */
export type PublicUser = Omit<User, 'password'>;

/** Payload aceito por POST /api/users. */
export interface CreateUserDTO {
    name: string;
    email: string;
    password: string;
}

/** Payload aceito por PATCH /api/users/:id (todos opcionais). */
export type UpdateUserDTO = Partial<CreateUserDTO>;
