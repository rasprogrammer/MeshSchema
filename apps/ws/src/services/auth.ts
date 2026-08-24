
import jwt from "jsonwebtoken";

interface DecodedToken {
    id: string;
}

export const authenticateToken = (token: string): DecodedToken | null => {
    try {
        if (!token) {
            console.log('No token provided');
            return null;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;
        if (!decoded || !decoded.id) {
            console.log('Invalid token');
            return null;
        }

        return decoded;

    } catch (error) {
        console.log('Error verifying token', error);
        return null;
    }
};