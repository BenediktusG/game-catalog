import Joi from 'joi';

const uploadValidation = Joi.object({
    name: Joi.string().min(3).max(100).pattern(/^[a-zA-Z0-9\s':-]+$/).required(),
    price: Joi.number().min(0).max(9999.99).precision(2).required(),
    description: Joi.string().min(10).max(100).required(),
});



export {
    uploadValidation,
};