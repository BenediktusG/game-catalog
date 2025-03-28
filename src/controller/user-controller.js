import userService from "../service/user-service"

const register = async (req, res, next) => {
    try {
        const result = await userService.register(req.body);
        res.status(201).json({
            message: 'User successfully created',
            data: result,
        });
    } catch (e) {
        next(e);
    }
}

const login = async (req, res, next) => {
    try {
        const result = await userService.login(req.body);
        res.status(200).json({
            message: 'User logged successfully',
            data: result,
        });
    } catch(e) {
        next(e);
    }
};

const getAllUsers = async (req, res, next) => {
    try {
        const result = await userService.getAllUsers(req.user);
        res.status(200).json({
            message: 'Successfully get all users data',
            data: result,
        });
    } catch (e) {
        next(e);
    }
}

const getSpecificUser = async (req, res, next) => {
    try {
        const result = await userService.getSpecificUser(req.user, req.params.userId);
        res.status(200).json({
            message: 'Successfully get specific user data',
            data: result,
        });
    } catch (e) {
        next(e);
    }
};

const updateUserData = async (req, res, next) => {
    try {
        const result = await userService.updateUserData(req.body, req.user, req.params.userId);
        res.status(200).json({
            message: 'Successfully updated user data',
            data: result,
        });
    } catch (e) {
        next(e);
    }
}

const updatePassword = async (req, res, next) => {
    try {
        await userService.updatePassword(req.body, req.params.userId, req.user);
        res.status(200).json({
            message: 'Successfully updated user password',
        });
    } catch (e) {
        next(e);
    }
};

const logout = async (req, res, next) => {
    try {
        await userService.logout(req.user);
        res.status(200).json({
            message: 'User successfully logged out',
        })
    } catch (e) {
        next(e);
    }
}

const deleteUser = async (req, res, next) => {
    try {
        await userService.deleteUser(req.user, req.params.userId);
        res.status(200).json({
            message: 'Successfully deteled user',
        });
    } catch (e) {
        next(e);
    }
}

export default {
    register,
    login,
    getAllUsers,
    getSpecificUser,
    updateUserData,
    updatePassword,
    logout,
    deleteUser
}