import { prismaClient } from "../application/database";
import { AuthorizationError } from "../error/authorization-error";
import { ConflictError } from "../error/conflict-error";
import { NotFoundError } from "../error/not-found-error";
import { createReviewValidation } from "../validation/review-validation"
import { validate } from "../validation/validation"

const create = async (request, gameId, user) => {
    request = validate(createReviewValidation, request);
    const isUserOwnedGame = await prismaClient.library.count({
        where: {
            userId: user.id,
            gameId: gameId,
        },
    });
    if (isUserOwnedGame === 0) {
        throw new AuthorizationError('You are not allowed to review this game because you do not own it');
    }
    const reviewCount = await prismaClient.review.count({
        where: {
            userId: user.id,
            gameId: gameId,
        }
    });
    if (reviewCount > 0) {
        throw new ConflictError('You are not allowed to review this game again, edit your previous review to change the review');
    }
    const create_time = new Date();
    return prismaClient.review.create({
        data: {
            gameId: gameId,
            userId: user.id,
            rating: request.rating,
            review: request.review,
            createdAt: create_time,
            updatedAt: create_time,
        },
        select: {
            id: true,
            userId: true,
            gameId: true,
            rating: true,
            review: true,
            createdAt: true,
            updatedAt: true,
        }
    });
};

const getSpecificReview = async (gameId, reviewId) => {
    const reviewCount = await prismaClient.review.count({
        where: {
            id: reviewId,
            gameId: gameId,
        },
    });
    if (reviewCount == 0) {
        throw new NotFoundError('Invalid game id or invalid review id');
    }
    return prismaClient.review.findUnique({
        where: {
            id: reviewId,
        },
        select: {
            id: true,
            userId: true,
            gameId: true,
            rating: true,
            review: true,
            createdAt: true,
            updatedAt: true,
        },
    });
}

const getAllReviews = async (gameId) => {
    const gameCount = await prismaClient.game.count({
        where: {
            id: gameId,
        }
    });
    if (gameCount !== 1) {
        throw new NotFoundError('Invalid game id');
    }
    return prismaClient.review.findMany({
        where: {
            gameId: gameId,
        },
        select: {
            rating: true,
            review: true,
            createdAt: true,
            user: {
                select: {
                    username: true,
                }
            }
        }
    }).then(reviews => reviews.map(review => ({
        ...review,
        username: review.user.username,
        user: undefined,
    })));
};

const edit = async (request, gameId, reviewId, user) => {
    request = validate(createReviewValidation, request);
    const gameCount = await prismaClient.game.count({
        where: {
            id: gameId,
        }
    });
    if (gameCount !== 1) {
        throw new NotFoundError('Invalid game id');
    }
    const review = await prismaClient.review.findUnique({
        where: {
            id: reviewId,
            gameId: gameId,
        }
    });
    if (!review) {
        throw new NotFoundError('Invalid review id');
    }
    if (review.userId !== user.id) {
        throw new AuthorizationError('Only review author can edit this review');
    }

    return prismaClient.review.update({
        where: {
            id: reviewId,
        },
        data: {
            rating: request.rating,
            review: request.review,
            updatedAt: new Date(),
        },
    });
};

const deleteReview = async (gameId, reviewId, user) => {
    const gameCount = await prismaClient.game.count({
        where: {
            id: gameId,
        }
    });
    if (gameCount !== 1) {
        throw new NotFoundError('Invalid game id');
    }
    const review = await prismaClient.review.findUnique({
        where: {
            id: reviewId,
            gameId: gameId,
        }
    });
    if (!review) {
        throw new NotFoundError('Invalid review id');
    }
    if (review.userId !== user.id && user.role !== 'ADMIN') {
        throw new AuthorizationError('you are not authorized to delete this review');
    }
    return prismaClient.review.delete({
        where: {
            id: reviewId,
        }
    });
};

export default {
    create,
    getSpecificReview,
    getAllReviews,
    edit,
    deleteReview,
}