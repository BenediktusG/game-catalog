import express from 'express';
import { authMiddleware } from '../middleware/auth-middleware';
import userController from '../controller/user-controller';
import gameController from '../controller/game-controller';
import libraryController from '../controller/library-controller';
import reviewController from '../controller/review-controller';

const userRouter = new express.Router();
userRouter.use(authMiddleware);

// User API
userRouter.get('/users', userController.getAllUsers);
userRouter.get('/users/:userId', userController.getSpecificUser);
userRouter.patch('/users/:userId', userController.updateUserData);
userRouter.patch('/users/:userId/password', userController.updatePassword);
userRouter.delete('/authentications', userController.logout);
userRouter.delete('/users/:userId', userController.deleteUser);

// Game API
userRouter.post('/games', gameController.upload);
userRouter.put('/games/:gameId', gameController.edit);
userRouter.delete('/games/:gameId', gameController.deleteGame);

// Library API
userRouter.post('/library', libraryController.buyGame);
userRouter.get('/library', libraryController.getAllGames);

// Review API
userRouter.post('/games/:gameId/reviews', reviewController.create);
userRouter.put('/games/:gameId/reviews/:reviewId', reviewController.edit);
userRouter.delete('/games/:gameId/reviews/:reviewId', reviewController.deleteReview);

export {
    userRouter,
};