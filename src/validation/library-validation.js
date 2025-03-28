import Joi from 'joi';

const buyGameValidation = Joi.object({
    gameId: Joi.string().uuid().required(),
});

export {
    buyGameValidation,
}