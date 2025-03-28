import Joi from 'joi';

const createReviewValidation = Joi.object({
    rating: Joi.number().min(1).max(5).precision(2).required(),
    review: Joi.string().min(10).max(1000).required(),
});

export {
    createReviewValidation,
}