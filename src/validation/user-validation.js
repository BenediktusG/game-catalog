import Joi from 'joi';

const registerUserValidation = Joi.object({
    username: Joi.string().min(4).max(20).pattern(/^[a-zA-Z0-9_]+$/).required(),
    email: Joi.string().email().required(),
    fullName: Joi.string().min(3).max(50).pattern(/^[a-zA-Z ]+$/).required(),
    password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_])[A-Za-z0-9@$!%*?&_]+$/).required(),
});

const updateUserDataValidation = Joi.object({
    username: Joi.string().min(4).max(20).pattern(/^[a-zA-Z0-9_]+$/),
    email: Joi.string().email(),
    fullName: Joi.string().min(3).max(50).pattern(/^[a-zA-Z ]+$/),
});

const loginValidation = Joi.object({
    username: Joi.string().min(4).max(20).pattern(/^[a-zA-Z0-9_]+$/).required(),
    password: Joi.string().min(8).required(),
});

const updatePasswordValidation = Joi.object({
    oldPassword: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_])[A-Za-z0-9@$!%*?&_]+$/).required(),
    newPassword: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_])[A-Za-z0-9@$!%*?&_]+$/).required(),
})

export {
    registerUserValidation,
    updateUserDataValidation,
    loginValidation,
    updatePasswordValidation,
}