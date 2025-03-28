import { logger } from "../application/logging";
import { ResponseError } from "../error/response-error";

const errorMiddleware = async (err, req, res, next) => {
    if (!err) {
        next();
        return;
    }
    if (err instanceof ResponseError) {
        res.status(err.status).json({
            message: err.message
        }).end();
    } else {
        res.status(500).json({
            errors: err.message,
        }).end();
    }
}

export {
    errorMiddleware,
}