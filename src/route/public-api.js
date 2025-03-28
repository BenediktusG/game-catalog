import express from 'express';
import userController from '../controller/user-controller';
import gameController from '../controller/game-controller';
import reviewController from '../controller/review-controller';

const publicRouter = express.Router();
publicRouter.post('/users', userController.register);
publicRouter.post('/authentications', userController.login);

// Game API
publicRouter.get('/games/:gameId', gameController.getSpecificGame);
publicRouter.get('/games', gameController.getAllGames);

// Review API
publicRouter.get('/games/:gameId/reviews/:reviewId', reviewController.getSpecificReview);
publicRouter.get('/games/:gameId/reviews', reviewController.getAllReviews);

export {
    publicRouter,
}