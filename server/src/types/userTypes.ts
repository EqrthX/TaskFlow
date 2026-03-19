
export interface RegisterRequest {
    email: string
    password: string
    passwordCon: string
    first_name: string
    last_name: string
}

export interface LoginRequest {
    email: string
    password: string
}


export interface AuthRequest {
    user?: {
        userId: string;
        email: string;
    }
}