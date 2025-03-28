import supertest from "supertest";
import { buyGame, createAdminToken, createGame, createReview, createUser, generateKey, generateReviewInformation, removeAllGames, removeAllReviews, removeAllUsers } from "./test-util";
import { web } from "../src/application/web";
import { logger } from "../src/application/logging";
import e from "express";

describe('POST /games/:gameId/reviews', () => {
    let key;

    beforeEach(() => {
        key = generateKey();
    });

    afterEach( async () => {
        await removeAllReviews(key);
        await removeAllGames(key);
        await removeAllUsers(key);
    });

    it('should can create a new review', async () => {
        const user = await createUser(key);
        const game = await createGame(key);
        const reviewInformation = generateReviewInformation(key);
        await buyGame(game.id, user.id);
        const result = await supertest(web)
            .post(`/games/${game.id}/reviews`)
            .set('Authorization', user.token)
            .send(reviewInformation);
        
        expect(result.status).toBe(201);
        const responseData = result.body.data;
        expect(responseData.userId).toBe(user.id);
        expect(responseData.gameId).toBe(game.id);
        expect(parseFloat(responseData.rating)).toBe(reviewInformation.rating);
        expect(responseData.review).toBe(reviewInformation.review);
    });

    it('should reject if requested by unathentic user', async () => {
        const reviewInformation = generateReviewInformation(key);
        const game = await createGame(key);
        const result = await supertest(web)
            .post(`/games/${game.id}/reviews`)
            .send(reviewInformation);
        
        expect(result.status).toBe(401);
    });

    it('should reject if requested by user who didnt own the game', async () => {
        const user = await createUser(key);
        const game = await createGame(key);
        const reviewInformation = generateReviewInformation(key);
        const result = await supertest(web)
            .post(`/games/${game.id}/reviews`)
            .set('Authorization', user.token)
            .send(reviewInformation);
        
        expect(result.status).toBe(403);
    });

    it('should reject if the user already have made review for the requested game before', async () => {
        const game = await createGame(key);
        const user = await createUser(key);
        await buyGame(game.id, user.id);
        await createReview(key, game.id, user.id);
        const reviewInformation = generateReviewInformation(key);
        
        const result = await supertest(web)
            .post(`/games/${game.id}/reviews`)
            .set('Authorization', user.token)
            .send(reviewInformation);
        logger.debug(result.body);
        expect(result.status).toBe(409);
    });

});


describe('GET /games/:gameId/reviews/:reviewId', () => {
    let key;

    beforeEach(() => {
        key = generateKey();
    });

    afterEach( async () => {
        await removeAllReviews(key);
        await removeAllGames(key);
        await removeAllUsers(key);
    });

    it('should can retrieve specific review', async () => {
        const user = await createUser(key);
        const game = await createGame(key);
        await buyGame(game.id, user.id);

        const review = await createReview(key, game.id, user.id);
        const result = await supertest(web)
            .get(`/games/${game.id}/reviews/${review.id}`);
        expect(result.status).toBe(200);
        result.body.data.createdAt = new Date(result.body.data.createdAt);
        result.body.data.updatedAt = new Date(result.body.data.updatedAt);
        expect(result.body.data).toEqual(review);
    });

    it('should reject if requested with invalid review id', async () => {
        const game = await createGame(key);
        const result = await supertest(web)
            .get(`/games/${game.id}/reviews/salah`);
        expect(result.status).toBe(404);
    });
});

describe('GET /games/:gameId/reviews', () => {
    let key;

    beforeEach(() => {
        key = generateKey();
    });

    afterEach( async () => {
        await removeAllReviews(key);
        await removeAllGames(key);
        await removeAllUsers(key);
    });

    it('should can get all of the reviews', async () => {
        const game = await createGame(key);
        const user1 = await createUser(key);
        const user2 = await createUser(key);
        await buyGame(game.id, user1.id);
        await buyGame(game.id, user2.id);
        const review = await createReview(key, game.id, user1.id);
        const result1 = await supertest(web)
            .get(`/games/${game.id}/reviews`);
        logger.debug(result1.body);
        expect(result1.status).toBe(200);
        expect(result1.body.data.gameId).toBe(game.id);
        expect(result1.body.data.gameName).toBe(game.name);
        expect(parseFloat(result1.body.data.gameRating)).toBe(review.rating);
        expect(result1.body.data.totalReview).toBe(1);
        expect(result1.body.data.reviews.length).toBe(1);
        expect(result1.body.data.reviews[0].username).toBe(user1.username);
        expect(parseFloat(result1.body.data.reviews[0].rating)).toBe(review.rating);
        expect(result1.body.data.reviews[0].review).toBe(review.review);
        expect(new Date(result1.body.data.reviews[0].createdAt)).toEqual(review.createdAt);
    });

    it('should reject if requested by invalid game id', async () => {
        const result = await supertest(web)
            .get('/games/salah/reviews');
        expect(result.status).toBe(404);
    });
});

describe('PUT /games/:gameId/reviews/:reviewId', () => {
    let key;

    beforeEach(() => {
        key = generateKey();
    });

    afterEach( async () => {
        await removeAllReviews(key);
        await removeAllGames(key);
        await removeAllUsers(key);
    });

    it('should can update game review', async () => {
        const user = await createUser(key);
        const game = await createGame(key);
        await buyGame(game.id, user.id);
        const review = await createReview(key, game.id, user.id);
        const reviewInformation = generateReviewInformation(key);
        const result = await supertest(web)
            .put(`/games/${game.id}/reviews/${review.id}`)
            .set('Authorization', user.token)
            .send(reviewInformation);
        logger.debug(result.body.data);
        expect(result.status).toBe(200);
        expect(result.body.data.rating).toBe(reviewInformation.rating);
        expect(result.body.data.review).toBe(reviewInformation.review);
        expect(new Date(result.body.data.updatedAt)).not.toEqual(new Date(result.body.data.createdAt));
    });  

    it('should reject if the request body is invalid', async () => {
        const user = await createUser(key);
        const game = await createGame(key);
        await buyGame(game.id, user.id);
        const review = await createReview(key, game.id, user.id);
        const result = await supertest(web)
            .put(`/games/${game.id}/reviews/${review.id}`)
            .set('Authorization', user.token)
            .send({
                review: 'salah',
                rating: 'salah',
            });
        expect(result.status).toBe(400);
    });

    it('should reject if requested by non-authenticated user', async () => {
        const user = await createUser(key);
        const game = await createGame(key);
        await buyGame(game.id, user.id);
        const review = await createReview(key, game.id, user.id);
        const reviewInformation = generateReviewInformation(key);
        const result = await supertest(web)
            .put(`/games/${game.id}/reviews/${review.id}`)
            .send(reviewInformation);
        logger.debug(result.body.data);
        expect(result.status).toBe(401);
    });  

    it('should reject if requested by non-authorized user', async () => {
        const user = await createUser(key);
        const user2 = await createUser(key);
        const game = await createGame(key);
        await buyGame(game.id, user.id);
        const review = await createReview(key, game.id, user.id);
        const reviewInformation = generateReviewInformation(key);
        const result = await supertest(web)
            .put(`/games/${game.id}/reviews/${review.id}`)
            .set('Authorization', user2.token)
            .send(reviewInformation);
        logger.debug(result.body.data);
        expect(result.status).toBe(403);
    });  

    it('should reject if requested with invalid review ID', async () => {
        const user = await createUser(key);
        const game = await createGame(key);
        await buyGame(game.id, user.id);
        const review = await createReview(key, game.id, user.id);
        const reviewInformation = generateReviewInformation(key);
        const result = await supertest(web)
            .put(`/games/${game.id}/reviews/salah`)
            .set('Authorization', user.token)
            .send(reviewInformation);
        logger.debug(result.body.data);
        expect(result.status).toBe(404);
    });

    it('should reject if requested with invalid gameId ID', async () => {
        const user = await createUser(key);
        const game = await createGame(key);
        await buyGame(game.id, user.id);
        const review = await createReview(key, game.id, user.id);
        const reviewInformation = generateReviewInformation(key);
        const result = await supertest(web)
            .put(`/games/salah/reviews/${review.id}`)
            .set('Authorization', user.token)
            .send(reviewInformation);
        logger.debug(result.body.data);
        expect(result.status).toBe(404);
    });
});

describe('DELETE /games/:gameId/reviews/:reviewId', () => {
    let key;

    beforeEach(() => {
        key = generateKey();
    });

    afterEach( async () => {
        await removeAllReviews(key);
        await removeAllGames(key);
        await removeAllUsers(key);
    });

    it('should be able to delete review', async () => {
        const user = await createUser(key);
        const game = await createGame(key);
        await buyGame(game.id, user.id);
        const review = await createReview(key, game.id, user.id);
        const result = await supertest(web)
            .delete(`/games/${game.id}/reviews/${review.id}`)
            .set('Authorization', user.token);
        logger.debug(result.body);
        expect(result.status).toBe(200);

        const result2 = await supertest(web)
            .get(`/games/${game.id}/reviews/${review.id}`);
        expect(result2.status).toBe(404);
    });

    it('should be able to delete a review if requested by an admin user', async () => {
        const adminToken = await createAdminToken();
        const user = await createUser(key);
        const game = await createGame(key);
        await buyGame(game.id, user.id);
        const review = await createReview(key, game.id, user.id);
        const result = await supertest(web)
            .delete(`/games/${game.id}/reviews/${review.id}`)
            .set('Authorization', adminToken);
        logger.debug(result.body);
        expect(result.status).toBe(200);

        const result2 = await supertest(web)
            .get(`/games/${game.id}/reviews/${review.id}`);
        expect(result2.status).toBe(404);
    });

    it('should reject if requested by a non-authenticated user', async () => {
        const user = await createUser(key);
        const game = await createGame(key);
        await buyGame(game.id, user.id);
        const review = await createReview(key, game.id, user.id);
        const result = await supertest(web)
            .delete(`/games/${game.id}/reviews/${review.id}`);
        logger.debug(result.body);
        expect(result.status).toBe(401);
    });

    it('should reject if requested by a non-authorized user', async () => {
        const user = await createUser(key);
        const user2 = await createUser(key);
        const game = await createGame(key);
        await buyGame(game.id, user.id);
        const review = await createReview(key, game.id, user.id);
        const result = await supertest(web)
            .delete(`/games/${game.id}/reviews/${review.id}`)
            .set('Authorization', user2.token);
        logger.debug(result.body);
        expect(result.status).toBe(403);
    });

    it('should reject if requested with an invalid game ID', async () => {
        const user = await createUser(key);
        const game = await createGame(key);
        await buyGame(game.id, user.id);
        const review = await createReview(key, game.id, user.id);
        const result = await supertest(web)
            .delete(`/games/salah/reviews/${review.id}`)
            .set('Authorization', user.token);
        logger.debug(result.body);
        expect(result.status).toBe(404);
    });

    it('should reject if requested with an invalid review ID', async () => {
        const user = await createUser(key);
        const game = await createGame(key);
        await buyGame(game.id, user.id);
        const review = await createReview(key, game.id, user.id);
        const result = await supertest(web)
            .delete(`/games/${game.id}/reviews/salah`)
            .set('Authorization', user.token);
        logger.debug(result.body);
        expect(result.status).toBe(404);
    });
});