import gameService from "../service/game-service";
import reviewService from "../service/review-service";

const create = async (req, res, next) => {
    try {
        const result = await reviewService.create(req.body, req.params.gameId, req.user);
        res.status(201).json({
            message: 'Review created successfully',
            data: result,
        });
    } catch (e) {
        next(e);
    }
}

const getSpecificReview = async (req, res, next) => {
    try {
        const result = await reviewService.getSpecificReview(req.params.gameId, req.params.reviewId);
        res.status(200).json({
            message: 'Reviews retrieved successfully',
            data: result,
        });
    } catch (e) {
        next(e);
    }
}

const getAllReviews = async (req, res, next) => {
    try {
        const game = await gameService.getSpecificGame(req.params.gameId);
        const result = await reviewService.getAllReviews(req.params.gameId);
        const gameRating = result.reduce((sum, item) => sum + item.rating, 0)/result.length;
        res.status(200).json({
            message: 'Success retrieved all game reviews', 
            data: {
                gameId: game.id,
                gameName: game.name,
                gameRating: gameRating,
                totalReview: result.length,
                reviews: result,
            }
        });
    } catch (e) {
        next(e);
    }
}

const edit = async (req, res, next) => {
    try {
        const result = await reviewService.edit(req.body, req.params.gameId, req.params.reviewId, req.user);
        res.status(200).json({
            message: 'Success edit game review',
            data: result,
        })
    } catch (e) {
        next(e);
    }
};

const deleteReview = async (req, res, next) => {
    try {
        await reviewService.deleteReview(req.params.gameId, req.params.reviewId, req.user);
        res.status(200).json({
            message: 'Review deleted successfully',
        });
    } catch (e) {
        next(e);
    }
}

export default {
    create,
    getSpecificReview,
    getAllReviews,
    edit,
    deleteReview,
}