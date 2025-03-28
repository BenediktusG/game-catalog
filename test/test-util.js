import supertest from "supertest";
import { prismaClient } from "../src/application/database"
import bcrypt from 'bcrypt';
import { web } from "../src/application/web";
import { logger } from "../src/application/logging";
import { faker } from "@faker-js/faker";

const generateUserInformation = () => {
    return {
        username: faker.person.firstName() + faker.number.int({min: 1, max: 100}),
        password: faker.internet.password() + '@11',
        fullName: faker.person.firstName().replace('-', '').replace("'", '') + ' ' + faker.person.lastName().replace('-', '').replace("'", ''),
        email: faker.internet.email(),
    }
};

const generateKey = () => {
    return faker.string.alpha({length: 4, casing:'mixed'});
}

const generateGameInformation = () => {
    return {
        name: faker.commerce.productName(),
        price: parseFloat(faker.commerce.price({min: 0, max: 9999.99, dec: 2})),
        description: faker.commerce.productDescription(),
    };
};

const createUsers = async (i, key) => {
    for (let j = 0; j < i; j++) {
        await createUser(key);
    }
}

const createAdminToken = async (key) => {
    const userInformation = generateUserInformation();
    userInformation.username = key + userInformation.username;
    await prismaClient.user.create({
        data: {
            username: userInformation.username,
            password: await bcrypt.hash(userInformation.password, 10),
            fullName: userInformation.fullName,
            email: userInformation.email,
            role: 'ADMIN',
        }
    });

    const result = await supertest(web)
        .post('/authentications')
        .send({
            username: userInformation.username,
            password: userInformation.password,
        });
    return result.body.data.token;
}

const createUser = async (key) => {
    const userInformation = generateUserInformation();
    userInformation.username = key + userInformation.username;
    await prismaClient.user.create({
        data: {
            username: userInformation.username,
            password: await bcrypt.hash(userInformation.password, 10),
            fullName: userInformation.fullName,
            email: userInformation.email,
        }
    });
    logger.debug(userInformation);
    const result = await supertest(web)
        .post('/authentications')
        .send({
            username: userInformation.username,
            password: userInformation.password,
        });
    logger.debug(result.body);
    userInformation.token = result.body.data.token;

    const result2 = await prismaClient.user.findUnique({
        where: {
            username: userInformation.username,
        }
    });
    userInformation.id = result2.id;
    return userInformation;
};

const createGame = async (key) => {
    const gameInformation = generateGameInformation();
    gameInformation.releasedAt = new Date();
    gameInformation.updatedAt = new Date();
    gameInformation.name = key + gameInformation.name;
    const result = await prismaClient.game.create({
        data: gameInformation,
    });
    gameInformation.id = result.id;
    return gameInformation;
};

const checkUserPassword = async (userId, userPassword) => {
    const result = await prismaClient.user.findUnique({
        where: {
            id: userId,
        }
    });
    const isPasswordValid = await bcrypt.compare(userPassword, result.password);
    if (!isPasswordValid) {
        return false;
    }
    return true;
}

const removeAllUsers = async (key) => {
    await prismaClient.user.deleteMany({
        where: {
            username: {
                startsWith: key,
            }
        }
    });
};

const removeAllGames = async (key) => {
    await prismaClient.game.deleteMany({
        where: {
            name: {
                startsWith: key,
            }
        }
    });
};

const countUsers = async () => {
    return await prismaClient.user.count();
};

const createGames = async (i, key) => {
    for (let j = 0; j < i; j++) {
        await createGame(key);
    }
};

const countGames = async () => {
    return prismaClient.game.count();
};

const checkGame = async (game_id) => {
    const gameCount = await prismaClient.game.count({
        where: {
            id: game_id,
        },
    });
    if (gameCount == 0) {
        return false;
    }
    return true;
}

const buyGame = async (game_id, user_id) => {
    await prismaClient.library.create({
        data: {
            userId: user_id,
            gameId: game_id,
            purchasedAt: new Date(),
        }
    });
}

const removeAllReviews = async (key) => {
    await prismaClient.review.deleteMany({
        where: {
            review: {
                startsWith: key,
            }
        }
    });
};

const generateReviewInformation = (key) => {
    return {
        rating: faker.number.float({max: 5, min: 1, fractionDigits: 2}),
        review: key + faker.commerce.productDescription(),
    };
};

const createReview = async (key, gameId, userId) => {
    const reviewInformation = generateReviewInformation(key);
    const create_time = new Date();
    return prismaClient.review.create({
        data: {
            userId: userId,
            gameId: gameId,
            rating: reviewInformation.rating,
            review: reviewInformation.review,
            createdAt: create_time,
            updatedAt: create_time,
        }
    });
};

export {
    generateUserInformation,
    createUser,
    removeAllUsers,
    removeAllGames,
    createUsers,
    createAdminToken,
    checkUserPassword,
    generateGameInformation,
    generateKey,
    countUsers,
    createGame,
    createGames,
    countGames,
    checkGame,
    buyGame,
    removeAllReviews,
    generateReviewInformation,
    createReview,
}