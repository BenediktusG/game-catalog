import { prismaClient } from "../application/database";
import { NotFoundError } from "../error/not-found-error";
import { buyGameValidation } from "../validation/library-validation"
import { validate } from "../validation/validation"

const buyGame = async (request, user) => {
    request = validate(buyGameValidation, request);
    const gameCount = await prismaClient.game.count({
        where: {
            id: request.gameId,
        }
    });
    if (gameCount !== 1) {
        throw new NotFoundError('Invalid game id');
    }
    return prismaClient.library.create({
        data: {
            userId: user.id,
            gameId: request.gameId,
            purchasedAt: new Date(),
        },
        include: {
            game: {
                select: {
                    price: true,
                }
            }
        }
    });
};

const getAllGames = async (user) => {
    return prismaClient.library.findMany({
        where: {
            userId: user.id,
        },
        include: {
            game: {
                select: {
                    id: true,
                    name: true,
                }
            }
        },
    });
}

export default {
    buyGame,
    getAllGames,
}