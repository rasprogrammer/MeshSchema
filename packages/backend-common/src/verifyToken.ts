
import jwt from 'jsonwebtoken';

interface TokenPayload {
    id: string;
}

export const verifyToken = (token: string, JWT_SECRET: string): TokenPayload | null => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
        return decoded;
    } catch (error) {
        return null;
    }
};