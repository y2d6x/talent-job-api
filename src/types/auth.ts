
export interface LoginRequest {
    email: string ;
    password: string;
}

export interface LoginResponse {
    success: boolean;
    data: {
        user: any;
        token: string;
    }
}

export interface RegisterRequest {
    email: string;
    password: string;
    username: string;
    // Add other fields as needed, e.g., name, username, etc.
}

export interface RegisterResponse {
    success: boolean;
    data: {
        user: any;
        token: string;
    }
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

export interface RefreshTokenResponse {
    success: boolean;
    data: {
        token: string;
    }
}


