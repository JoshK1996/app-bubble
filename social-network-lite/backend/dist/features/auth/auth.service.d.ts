import { Role } from '../../types/role.enum';
export interface RegisterUserRequest {
    email: string;
    username: string;
    password: string;
    fullName: string;
}
export interface LoginUserRequest {
    email: string;
    password: string;
}
export interface AuthResponse {
    token: string;
    user: {
        id: string;
        email: string;
        username: string;
        fullName: string;
        role: Role | any;
    };
}
/**
 * Service for handling user authentication
 */
export declare class AuthService {
    /**
     * Register a new user
     * @param userData User registration data
     * @returns Authentication response with token and user information
     */
    register(userData: RegisterUserRequest): Promise<AuthResponse>;
    /**
     * Login a user
     * @param loginData User login credentials
     * @returns Authentication response with token and user information
     * @throws Error if login fails
     */
    login(loginData: LoginUserRequest): Promise<AuthResponse>;
    /**
     * Get current user by ID
     * @param userId User ID to retrieve
     * @returns User information
     * @throws Error if user is not found
     */
    getCurrentUser(userId: string): Promise<Omit<AuthResponse['user'], 'token'>>;
    /**
     * Generate a JWT token for authentication
     * @param userId User ID to include in the token
     * @param role User role to include in the token
     * @returns JWT token string
     */
    private generateToken;
}
