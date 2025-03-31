import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      role: string;
    }
    
    export interface Request {
      user?: User;
    }
  }
} 