import supertest from "supertest";
import { checkGame, createAdminToken, createGame, createGames, createUser, generateGameInformation, generateKey, removeAllGames, removeAllUsers } from "./test-util"
import { web } from "../src/application/web";
import { logger } from "../src/application/logging";

describe('POST /games', () => {
    let key;
    beforeEach(() => {
        key = generateKey();
    })
    afterEach(async () => {
        await removeAllGames(key);
        await removeAllUsers(key);
    });

    it('should can upload a game', async () => {
        const token = await createAdminToken(key);
        const gameInformation = generateGameInformation(key);
        gameInformation.name = key + gameInformation.name;
        const result = await supertest(web)
            .post('/games')
            .set('Authorization', token)
            .send(gameInformation);
        
        logger.debug(result.body);
        expect(result.status).toBe(201);
        expect(result.body.data.id).toBeDefined();
        expect(result.body.data.name).toBe(gameInformation.name);
        expect(parseFloat(result.body.data.price)).toBe(gameInformation.price);
        expect(result.body.data.description).toBe(gameInformation.description);
    });

    it('should reject if the request body is invalid', async () => {
        const token = await createAdminToken(key);

        const result = await supertest(web)
            .post('/games')
            .set('Authorization', token)
            .send({
                "name": "",
                "price": -1,
                "description": ""
            });

        expect(result.status).toBe(400);
    });

    it('should reject if requested by non-admin user', async () => {
        const user = await createUser(key);

        const result = await supertest(web)
            .post('/games')
            .set('Authorization', user.token)
            .send({
                "name": "The Legend of Zelda: Breath of the Wild",
                "price": 59.99,
                "description": "An open-world adventure game where you explore the kingdom of Hyrule."
            });
        
        logger.debug(result.body);
        expect(result.status).toBe(403);
    })
});

describe('GET /games/:gameId', () => {
    let key;
    beforeEach(() => {
        key = generateKey();
    });

    afterEach(async () => {
        await removeAllGames(key);
    });

    it('should can get specific game data', async () => {
        const game = await createGame(key);
        const result = await supertest(web)
            .get(`/games/${game.id}`);
        logger.debug(result.body);
        expect(result.status).toBe(200);
        result.body.data.price = parseFloat(result.body.data.price);
        result.body.data.updatedAt = new Date(result.body.data.updatedAt);
        result.body.data.releasedAt = new Date(result.body.data.releasedAt);
        expect(result.body.data).toEqual(game);
    });

    it ('should reject if requested by invalid id', async () => {
        const result = await supertest(web)
            .get('/games/salah');
        expect(result.status).toBe(404);
    });
});

describe('GET /games', () => {
    let key;
    beforeEach(() => {
        key = generateKey();
    });

    afterEach(async () => {
        await removeAllGames(key);
        await removeAllUsers(key);
    });

    it('should can retrieve all of the games', async () => {
        await createGames(5, key);
        const result = await supertest(web)
            .get('/games?page=2&limit=2');
        expect(result.status).toBe(200);
        expect(result.body.data.length).toBe(2);
    });
});

describe('PUT /games/:gameId', () => {
    let key;
    beforeEach(() => {
        key = generateKey();
    });

    afterEach(async () => {
        await removeAllGames(key);
        await removeAllUsers(key);
    });

    it('should can update game information', async () => {
        const game = await createGame(key);
        const token = await createAdminToken(key);
        const gameInformation = generateGameInformation(key);
        gameInformation.name = key + gameInformation.name;
        const result = await supertest(web)
            .put(`/games/${game.id}`)
            .set('Authorization', token)
            .send(gameInformation);
        expect(result.status).toBe(200);
        const resultData = result.body.data;
        expect(resultData.name).toBe(gameInformation.name);
        expect(resultData.description).toBe(gameInformation.description);
        resultData.price = parseFloat(resultData.price);
        expect(resultData.price).toBe(gameInformation.price);
    });

    it('should reject if requested by non-admin user', async () => {
        const game = await createGame(key);
        const user = await createUser(key);
        const gameInformation = generateGameInformation();
        const result = await supertest(web)
            .put(`/games/${game.id}`)
            .set('Authorization', user.token)
            .send(gameInformation);
        expect(result.status).toBe(403);
    });

    it('should reject if requested by aunthentic user', async () => {
        const game = await createGame(key);
        const gameInformation = generateGameInformation();
        const result = await supertest(web)
            .put(`/games/${game.id}`)
            .send(gameInformation);
        expect(result.status).toBe(401);
    });

    it('should reject if the game id is invalid', async () => {
        const token = await createAdminToken(key);
        const gameInformation = generateGameInformation();
        const result = await supertest(web)
            .put(`/games/salah`)
            .set('Authorization', token)
            .send(gameInformation);
        expect(result.status).toBe(404);
    });
});

describe('DELETE /games/:gameId', () => {
    let key;

    beforeEach(() => {
        key = generateKey();
    });

    afterEach(async () => {
        await removeAllGames(key);
        await removeAllUsers(key);
    });

    it('should can delete game', async () => {
        const game = await createGame(key);
        const token = await createAdminToken(key);
        const result = await supertest(web)
            .delete(`/games/${game.id}`)
            .set('Authorization', token);
        expect(result.status).toBe(200);
        expect(await checkGame(game.id)).toBe(false);
    });

    it('should reject if requested by non-admin user', async () => {
        const game = await createGame(key);
        const user = await createUser(key);
        const result = await supertest(web)
            .delete(`/games/${game.id}`)
            .set('Authorization', user.token);
        expect(result.status).toBe(403);
        expect(await checkGame(game.id)).toBe(true);
    });

    it('should reject if requested by unauthetic user', async () => {
        const game = await createGame(key);
        const result = await supertest(web)
            .delete(`/games/${game.id}`);
        expect(result.status).toBe(401);
        expect(await checkGame(game.id)).toBe(true);
    });

    it('should reject if game id is invalid', async () => {
        const token = await createAdminToken(key);
        const result = await supertest(web)
            .delete('/games/salah')
            .set('Authorization', token);
        logger.debug(result.body);
        expect(result.status).toBe(404);
    });
})