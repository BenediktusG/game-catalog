import { prismaClient } from "../application/database";
import { AuthorizationError } from "../error/authorization-error";
import { NotFoundError } from "../error/not-found-error";
import { uploadValidation } from "../validation/game-validation"
import { validate } from "../validation/validation"

const upload = async (request, user) => {
    request = validate(uploadValidation, request);
    if (user.role !== 'ADMIN') {
        throw new AuthorizationError('Non-admin user cannot upload a new game');
    }
    return await prismaClient.game.create({
        data: {
            name: request.name,
            price: request.price,
            description: request.description,
            releasedAt: new Date(),
            updatedAt: new Date(),
        },
        select: {
            id: true,
            name: true,
            description: true,
            price: true,
            releasedAt: true,
            updatedAt: true,
        },
    });
};

const getSpecificGame = async (game_id) => {
    const countGame = await prismaClient.game.count({
        where: {
            id: game_id,
        }
    });
    if (countGame !== 1) {
        throw new NotFoundError('Game id is invalid');
    }
    return await prismaClient.game.findUnique({
        where: {
            id: game_id,
        },
        select: {
            id: true,
            name: true,
            description: true,
            price: true,
            releasedAt: true,
            updatedAt: true,
        }
    });
}; 

const getAllGames = async ({ page=1, limit=10 }) => {
    if (page < 1) page = 1;
    if (limit < 1 || limit > 100) limit = 10;
    return prismaClient.game.findMany({
        skip: (page - 1)*limit,
        take: limit,
    });
};

const edit = async (request, game_id, user) => {
    request = validate(uploadValidation, request);
    if (user.role !== 'ADMIN') {
        throw new AuthorizationError('Non-admin user cannot update game information');
    }
    const gameCount = await prismaClient.game.count({
        where: {
            id: game_id,
        }
    });

    if (gameCount !== 1) {
        throw new NotFoundError('Invalid game id');
    }

    return prismaClient.game.update({
        where: {
            id: game_id,
        },
        data: {
            name: request.name,
            price: request.price,
            description: request.description,
            releasedAt: new Date(),
        },
        select: {
            id: true,
            name: true,
            description: true,
            price: true,
            releasedAt: true,
            updatedAt: true,
        },
    });
};

const deleteGame = async (game_id, user) => {
    if (user.role !== 'ADMIN') {
        throw new AuthorizationError('Non-admin user cannot delete game');
    }
    const gameCount = await prismaClient.game.count({
        where: {
            id: game_id,
        },
    });
    if (gameCount !== 1) {
        throw new NotFoundError('Invalid game id');
    }
    return prismaClient.game.delete({
        where: {
            id: game_id,
        },
    });
};

export default {
    upload,
    getSpecificGame,
    getAllGames,
    edit,
    deleteGame,
};