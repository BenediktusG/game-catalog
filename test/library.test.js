import supertest from "supertest";
import { buyGame, createGame, createUser, generateKey, removeAllGames, removeAllUsers } from "./test-util";
import { web } from "../src/application/web";
import { logger } from "../src/application/logging";

describe('POST /library', () => {
    let key;

    beforeEach(() => {
        key = generateKey();
    });

    afterEach(async () => {
        await removeAllGames(key);
        await removeAllUsers(key);
    });

    it('should can buy game', async () => {
        const user = await createUser(key);
        const game = await createGame(key);
        const result = await supertest(web)
            .post('/library')
            .set('Authorization', user.token)
            .send({
                gameId: game.id,
            });
        logger.debug(result.body);
        expect(result.status).toBe(201);
        expect(result.body.data.gameId).toBe(game.id);
        result.body.data.price = parseFloat(result.body.data.price);
        expect(result.body.data.price).toBe(game.price);
    });

    it('should reject if requested by unauthentic user', async () => {
        const game = await createGame(key);
        const result = await supertest(web)
            .post('/library')
            .send({
                gameId: game.id,
            });
        expect(result.status).toBe(401);
    });

    it('should reject if given invalid id', async () => {
        const user = await createUser(key);
        const result = await supertest(web)
            .post('/library')
            .set('Authorization', user.token)
            .send({
                gameId: 'asalah'
            });
        logger.debug(result.body);
        expect(result.status).toBe(400);
    });
});

describe('GET /library', () => {
    let key;

    beforeEach(() => {
        key = generateKey();
    });

    afterEach(async () => {
        await removeAllGames(key);
        await removeAllUsers(key);
    });

    it('should can retrieve all of the games that user have bought', async () => {
        const user = await createUser(key);
        const game = await createGame(key);
        await buyGame(game.id, user.id);
        const result = await supertest(web)
            .get('/library')
            .set('Authorization', user.token);
        expect(result.status).toBe(200);
        expect(result.body.data.totalGame).toBe(1);
        expect(result.body.data.games).toHaveLength(1);
        const game_data = result.body.data.games[0];
        expect(game_data.gameId).toBe(game.id);
        expect(game_data.gameName).toBe(game.name);
    });

    it('should reject if requested by unauthentic user', async () => {
        const result = await supertest(web)
            .get('/library');
        expect(result.status).toBe(401);
    });
});