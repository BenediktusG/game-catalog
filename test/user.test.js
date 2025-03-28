import supertest from "supertest";
import { checkUserPassword, countUsers, createAdminToken, createUser, createUsers, generateKey, generateUserInformation, removeAllUsers } from "./test-util"
import { web } from "../src/application/web";
import { logger } from "../src/application/logging";

describe('POST /users', () => {
    let key;
    beforeEach(() => {
        key = generateKey();
    });
    afterEach(async () => {
        await removeAllUsers(key);
    });

    it('should can register new user', async() => {
        const userInformation = generateUserInformation();
        userInformation.username = key + userInformation.username;
        logger.debug(userInformation.password);
        const result = await supertest(web)
            .post('/users')
            .send(userInformation);
        logger.debug(result.body);
        expect(result.status).toBe(201);
        const user_result = result.body.data;
        expect(user_result.username).toBe(userInformation.username);
        expect(user_result.email).toBe(userInformation.email);
        expect(user_result.fullName).toBe(userInformation.fullName);
        expect(user_result.password).toBeUndefined();
    });

    it('should reject if the request is invalid', async () => {
        const result = await supertest(web)
            .post('/users')
            .send({
                username: '',
                email: 'test@gmail.com',
                fullName: 'Test',
                password: 'rahasiaSekali1@',
            });
        expect(result.status).toBe(400);
        expect(result.body.message).toBeDefined();
    });

    it('should reject if the username already exists', async () => {
        const userInformation = generateUserInformation();
        userInformation.username = key + userInformation.username;
        let result = await supertest(web)
            .post('/users')
            .send(userInformation);
        logger.debug(result);
        expect(result.status).toBe(201);
        const user_result = result.body.data;
        expect(user_result.username).toBe(userInformation.username);
        expect(user_result.email).toBe(userInformation.email);
        expect(user_result.fullName).toBe(userInformation.fullName);
        expect(user_result.password).toBeUndefined();

        result = await supertest(web)
            .post('/users')
            .send(userInformation);
        expect(result.status).toBe(409);
        expect(result.body.message).toBeDefined();
    })
});

describe('POST /authentications', () => {
    let key;
    beforeEach(() => {
        key = generateKey();
    })
    afterEach(async () => {
        await removeAllUsers(key);
    });

    it('should can login', async () => {
        const userInformation = await createUser(key);
        const result = await supertest(web)
            .post('/authentications')
            .send({
                username: userInformation.username,
                password: userInformation.password,
            });
        
        logger.debug(result.body);
        expect(result.status).toBe(200);
        expect(result.body.data.token).toBeDefined();
    });

    it('should reject if request is invalid', async () => {
        const result = await supertest(web)
            .post('/authentications')
            .send({
                username: '',
                password: '',
            });
        
        expect(result.status).toBe(400);
        expect(result.body.message).toBeDefined();
    });

    it('should reject if request request password is wrong', async () => {
        const userInformation = await createUser(key);
        const result = await supertest(web)
            .post('/authentications')
            .send({
                username: userInformation.username,
                password: 'Salah@1234',
            });
        
        logger.debug(result.body);
        expect(result.status).toBe(401);
    });

    it('should reject if request request username is wrong', async () => {
        const result = await supertest(web)
            .post('/authentications')
            .send({
                username: 'sangatsalah',
                password: 'rahasiasekali1@',
            });
        
        expect(result.status).toBe(401);
        expect(result.body.message).toBeDefined();
    });
});

describe('GET /users', () => {
    let key;
    beforeEach(() => {
        key = generateKey();
    })
    afterEach(async () => {
        await removeAllUsers(key);
    });

    it('should can retrieve all of the users', async () => {
        const token = await createAdminToken(key);
        await createUsers(5, key);
        const result = await supertest(web)
            .get('/users')
            .set('Authorization', token);
        expect(result.status).toBe(200);
        const getUserCount = await countUsers();
        expect(result.body.data.length).toBe(getUserCount);
    });

    it('should reject unauthentic user', async () => {
        const result = await supertest(web)
            .get('/users');
        expect(result.status).toBe(401);
    });

    it('should reject unauthorized user', async () => {
        const userInformation = await createUser(key);
        const result = await supertest(web)
            .get('/users')
            .set('Authorization', userInformation.token);
        expect(result.status).toBe(403);
    });
});

describe('GET /users/:userId', () => {
    let key;
    beforeEach(() => {
        key = generateKey();
    })
    afterEach(async () => {
        await removeAllUsers(key);
    });

    it('should can get specific user data if requested by its user', async () => {
        const userInformation = await createUser(key);
        const result = await supertest(web)
            .get(`/users/${userInformation.id}`)
            .set('Authorization', userInformation.token);
        expect(result.status).toBe(200);
        expect(result.body.data.id).toBe(userInformation.id);
        expect(result.body.data.username).toBe(userInformation.username);
        expect(result.body.data.fullName).toBe(userInformation.fullName);
        expect(result.body.data.email).toBe(userInformation.email);
    });

    it('should can get specific user data if requested by admin', async () => {
        const userInformation = await createUser(key);
        const token = await createAdminToken(key);
        const result = await supertest(web)
            .get(`/users/${userInformation.id}`)
            .set('Authorization', token);
        expect(result.status).toBe(200);
        expect(result.body.data.id).toBe(userInformation.id);
        expect(result.body.data.username).toBe(userInformation.username);
        expect(result.body.data.fullName).toBe(userInformation.fullName);
        expect(result.body.data.email).toBe(userInformation.email);
    });

    it('should reject if the userId is invalid', async () => {
        const token = await createAdminToken(key);
        const result = await supertest(web)
            .get(`/users/salah`)
            .set('Authorization', token);
        expect(result.status).toBe(404);
    });

    it('should reject if the request is not authenticated', async () => {
        const userInformation = await createUser(key);
        const result = await supertest(web)
            .get(`/users/${userInformation.token}`);
        expect(result.status).toBe(401);
    });

    it('should reject if requested from other non admin user', async () => {
        const user1 = await createUser(key);
        const user2 = await createUser(key);
        const result = await supertest(web)
            .get(`/users/${user1.id}`)
            .set('Authorization', user2.token);
        expect(result.status).toBe(403);
    });
});

describe('PATCH /users/:userId', () => {
    let key;
    beforeEach(() => {
        key = generateKey();
    })
    afterEach(async () => {
        await removeAllUsers(key);
    });

    it('should can update user data if requested by its user', async () => {
        const user = await createUser(key);
        const result = await supertest(web)
            .patch(`/users/${user.id}`)
            .set('Authorization', user.token)
            .send({
                username: key+'testlagi',
                email: 'testlagi@mail.com',
                fullName: 'TESTlagi',
            });
        logger.debug(result.body);
        expect(result.status).toBe(200);
        expect(result.body.data.id).toBe(user.id);
        expect(result.body.data.username).toBe(key+'testlagi');
        expect(result.body.data.email).toBe('testlagi@mail.com');
        expect(result.body.data.fullName).toBe('TESTlagi');
    });

    it('should can update user username', async () => {
        const user = await createUser(key);
        const result = await supertest(web)
            .patch(`/users/${user.id}`)
            .set('Authorization', user.token)
            .send({
                username: key+'testlagi',
            });
        logger.debug(result.body);
        expect(result.status).toBe(200);
        expect(result.body.data.id).toBe(user.id);
        expect(result.body.data.username).toBe(key + 'testlagi');
    });

    it('should can update user email', async () => {
        const user = await createUser(key);
        const result = await supertest(web)
            .patch(`/users/${user.id}`)
            .set('Authorization', user.token)
            .send({
                email: 'testlagi@mail.com',
            });
            
        expect(result.status).toBe(200);
        expect(result.body.data.id).toBe(user.id);
        expect(result.body.data.email).toBe('testlagi@mail.com');
    });

    it('should can update user fullname', async () => {
        const user = await createUser(key);
        const result = await supertest(web)
            .patch(`/users/${user.id}`)
            .set('Authorization', user.token)
            .send({
                fullName: 'TESTlagi',
            });
        expect(result.status).toBe(200);
        expect(result.body.data.id).toBe(user.id);
        expect(result.body.data.fullName).toBe('TESTlagi');
    });

    it('should can update user data if requested by admin user', async () => {
        const token = await createAdminToken(key);
        const user = await createUser(key);
        const result = await supertest(web)
            .patch(`/users/${user.id}`)
            .set('Authorization', token)
            .send({
                username: key+'testlagi',
                email: 'testlagi@mail.com',
                fullName: 'TESTlagi',
            });
            
        expect(result.status).toBe(200);
        expect(result.body.data.id).toBe(user.id);
        expect(result.body.data.username).toBe(key+'testlagi');
        expect(result.body.data.email).toBe('testlagi@mail.com');
        expect(result.body.data.fullName).toBe('TESTlagi');
    });

    it('should reject if requested by unathentic user', async () => {
        const user = await createUser(key);
        const result = await supertest(web)
            .patch(`/users/${user.id}`)
            .send({
                username: 'testlagi',
                email: 'testlagi@mail.com',
                fullName: 'TESTlagi',
            });
            
        expect(result.status).toBe(401);
    });

    it('should reject if requested by other non admin user', async () => {
        const user1 = await createUser(key);
        const user2 = await createUser(key);
        const result = await supertest(web)
            .patch(`/users/${user1.id}`)
            .set('Authorization', user2.token)
            .send({
                username: 'testlagi',
                email: 'testlagi@mail.com',
                fullName: 'TESTlagi',
            });
            
        expect(result.status).toBe(403);
    });

    it('should reject if the user id is invalid', async () => {
        const token = await createAdminToken(key);
        const result = await supertest(web)
            .patch(`/users/salah`)
            .set('Authorization', token)
            .send({
                username: 'testlagi',
                email: 'testlagi@mail.com',
                fullName: 'TESTlagi',
            });
            
        expect(result.status).toBe(404);
    });

    it('should reject if the username was already taken', async () => {
        const user1 = await createUser(key);
        const user2 = await createUser(key);
        const token = await createAdminToken(key);
        const result = await supertest(web)
            .patch(`/users/${user1.id}`)
            .set('Authorization', token)
            .send({
                username: user2.username,
                email: 'testlagi@mail.com',
                fullName: 'TESTlagi',
            });
            
        expect(result.status).toBe(409);
    });
});

describe('PATCH /users/:userId/password', () => {
    let key;
    beforeEach(() => {
        key = generateKey();
    })
    afterEach(async () => {
        await removeAllUsers(key);
    });

    it('should can change user password', async () => {
        const user = await createUser(key);
        const result = await supertest(web)
            .patch(`/users/${user.id}/password`)
            .set('Authorization', user.token)
            .send({
                oldPassword: user.password,
                newPassword: 'rahasiaSekali2@'
            });
        logger.debug(result.body);
        expect(result.status).toBe(200);
        const isPasswordValid = await checkUserPassword(user.id, 'rahasiaSekali2@');
        expect(isPasswordValid).toBe(true);
    });

    it('should reject if the password is invalid', async () => {
        const user = await createUser(key);
        const result = await supertest(web)
            .patch(`/users/${user.id}/password`)
            .set('Authorization', user.token)
            .send({
                oldPassword: '',
                newPassword: ''
            });
        expect(result.status).toBe(400);
    });

    it('should reject if requested by unauthentic user', async () => {
        const user = await createUser(key);
        const result = await supertest(web)
            .patch(`/users/${user.id}/password`)
            .send({
                oldPassword: 'rahasiaSekali1@',
                newPassword: 'rahasiaSekali2@'
            });
        expect(result.status).toBe(401);
    });

    it('should reject if requested by other user', async () => {
        const user1 = await createUser(key);
        const user2 = await createUser(key);
        const result = await supertest(web)
            .patch(`/users/${user1.id}/password`)
            .set('Authorization', user2.token)
            .send({
                oldPassword: 'rahasiaSekali1@',
                newPassword: 'rahasiaSekali2@'
            });
        expect(result.status).toBe(403);
    });
});

describe('DELETE /authentications', () => {
    let key;
    beforeEach(() => {
        key = generateKey();
    })
    afterEach(async () => {
        await removeAllUsers(key);
    });

    it('should delete user token', async () => {
        const user = await createUser(key);
        const result = await supertest(web)
            .delete('/authentications')
            .set('Authorization', user.token);
        expect(result.status).toBe(200);
        const result2 = await supertest(web)
            .get(`/users/${user.id}`)
            .set('Authorization', user.token);
        expect(result2.status).toBe(401);
    });

    it ('should reject if requested by unauthentic user', async () => {
        const result = await supertest(web)
            .delete('/authentications');
        expect(result.status).toBe(401);
    });
});

describe('DELETE /users/:userId', () => {
    let key;
    beforeEach(() => {
        key = generateKey();
    })
    afterEach(async () => {
        await removeAllUsers(key);
    });

    it('should can delete user', async () => {
        const user = await createUser(key);
        const result = await supertest(web)
            .delete(`/users/${user.id}`)
            .set('Authorization', user.token);
        expect(result.status).toBe(200);

        const result2 = await supertest(web)
            .post('/authentication')
            .send({
                username: user.username,
                password: user.password,
            });
        expect(result2.status).toBe(401);
    });

    it('should can delete user if requested by admin user', async () => {
        const token = await createAdminToken(key);
        const user  = await createUser(key);
        const result = await supertest(web)
            .delete(`/users/${user.id}`)
            .set('Authorization', token);
        expect(result.status).toBe(200);

        const result2 = await supertest(web)
            .post('/authentication')
            .send({
                username: user.username,
                password: user.password,
            });
        expect(result2.status).toBe(401);
    });

    it('should reject if requested by unauthentic user', async () => {
        const user = await createUser(key);
        const result = await supertest(web)
            .delete(`/users/${user.id}`);
        expect(result.status).toBe(401);
    });

    it('should reject if requested by other non admin user', async () => {
        const user1 = await createUser(key);
        const user2 = await createUser(key);
        const result = await supertest(web)
            .delete(`/users/${user1.id}`)
            .set('Authorization', user2.token);
        expect(result.status).toBe(403);
    });
});