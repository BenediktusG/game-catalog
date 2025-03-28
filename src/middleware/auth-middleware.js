import { prismaClient } from "../application/database";
import { logger } from "../application/logging";
import { AuthenticationError } from "../error/authentication-error";
import { verifyToken } from "../utils/jwtUtils";

export const authMiddleware = async (req, res, next) => {
    const token = req.get('Authorization');
    if (!token) {
        next(new AuthenticationError('You need to sign in to access this resource'));
    } else {
        const user = verifyToken(token);
        if (!user) {
            next(new AuthenticationError("Your token is expired, please sign in again"));
        } else {
            const user_in_db = await prismaClient.user.findUnique({
                where: {
                    id: user.id,
                }
            });
            if (user_in_db.token !== token) {
                next(new AuthenticationError('You need to sign in to access this resource'));
            }
            req.user = user;
            next();
        }
    }   
}