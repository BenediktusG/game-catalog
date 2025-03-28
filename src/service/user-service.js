import { prismaClient } from "../application/database";
import { logger } from "../application/logging";
import { AuthenticationError } from "../error/authentication-error";
import { AuthorizationError } from "../error/authorization-error";
import { ConflictError } from "../error/conflict-error";
import { NotFoundError } from "../error/not-found-error";
import { generateToken } from "../utils/jwtUtils";
import { loginValidation, registerUserValidation, updatePasswordValidation, updateUserDataValidation } from "../validation/user-validation";
import { validate } from "../validation/validation";
import bcrypt from 'bcrypt';

const register = async (request) => {
    const user = validate(registerUserValidation, request);

    const countUser = await prismaClient.user.count({
        where: {
            username: user.username,
        }
    });

    if (countUser > 0) {
        throw new ConflictError('Username already exists');
    }

    user.password = await bcrypt.hash(user.password, 10);

    return prismaClient.user.create({
        data: user,
        select: {
            id: true,
            username: true,
            fullName: true,
            email: true,
        }
    });
}

const login = async (request) => {
    const credential = validate(loginValidation, request);
    const user = await prismaClient.user.findUnique({
        where: {
            username: credential.username,
        }
    });

    if (!user) {
       throw new AuthenticationError("username and password didn't match");
    }

    const isPasswordValid = await bcrypt.compare(credential.password, user.password);
    if (!isPasswordValid) {
        throw new AuthenticationError("username and password didn't match");
    }

    const token = generateToken(user);
    return await prismaClient.user.update({
        where: {
            id: user.id,
        },
        data: {
            token: token,
        }
    });
}

const getAllUsers = async (user) => {
    if (user.role !== 'ADMIN') {
        throw new AuthorizationError('User cannot access this resource');
    }
    return await prismaClient.user.findMany({
        select: {
            id: true,
            email: true,
            username: true,
            fullName: true,
        },
    });
};

const getSpecificUser = async (user, user_id) => {
    if (user.id !== user_id && user.role !== 'ADMIN') {
        throw new AuthorizationError('user cannot access this resource');
    }
    const user_db = await prismaClient.user.findUnique({
        where: {
            id: user_id,
        },
        select: {
            id: true,
            username: true,
            fullName: true,
            email: true,
        }
    });
    if (!user_db) {
        throw new NotFoundError('UserId is invalid');
    }
    return user_db;
};

const updateUserData = async (request, user, user_id) => {
    request = validate(updateUserDataValidation, request);
    if (user_id !== user.id && user.role !== 'ADMIN') {
        throw new AuthorizationError('user cannot access this resource');
    }
    const data = {}
    if (request.username) {
        data.username = request.username;
        const user_count = await prismaClient.user.count({
            where: {
                username: request.username,
            }
        });
        if (user_count > 0) {
            throw new ConflictError('Username already exists');
        }
    }
    if (request.email) {
        data.email = request.email;
    }
    if (request.fullName) {
        data.fullName = request.fullName;
    }
    const user_count = await prismaClient.user.count({
        where: {
            id: user_id,
        }
    });
    if (user_count === 0) {
        throw new NotFoundError('UserId is invalid');
    }
    return await prismaClient.user.update({
        where: {
            id: user_id,
        },
        data: data,
        select: {
            id: true,
            username: true,
            fullName: true,
            email: true,
        }
    });
};

const updatePassword = async (request, user_id, user) => {
    request = validate(updatePasswordValidation, request);
    if (user_id !== user.id) {
        throw new AuthorizationError('User cannot access this resource');
    }
    const user_in_db = await prismaClient.user.findUnique({
        where: {
            id: user_id,
        }
    });

    if (!user_in_db) {
        throw new NotFoundError('UserId is invalid');
    }
    const isPasswordValid = await bcrypt.compare(request.oldPassword, user_in_db.password);
    if (!isPasswordValid) {
        throw new AuthenticationError('OldPassword is wrong');
    }
    logger.debug(isPasswordValid);
    const hashedNewPassword = await bcrypt.hash(request.newPassword, 10);
    await prismaClient.user.update({
        where: {
            id: user_id,
        },
        data: {
            password: hashedNewPassword,
        }
    });
};

const logout = async (user) => {
    await prismaClient.user.update({
        where: {
            id: user.id,
        },
        data: {
            token: null,
        }
    });
};

const deleteUser = async (user, user_id) => {
    if (user_id !== user.id && user.role !== 'ADMIN') {
        throw new AuthorizationError('user cannot access this resource');
    }
    await prismaClient.user.delete({
        where: {
            id: user.id,
        },
    });
};

export default {
    register,
    login,
    getAllUsers,
    getSpecificUser,
    updateUserData,
    updatePassword,
    logout,
    deleteUser,
}