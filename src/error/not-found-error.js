import { ResponseError } from "./response-error";

class NotFoundError extends ResponseError {
    constructor(message) {
        super(404, message);
        this.name = 'NotFoundError';
    }
}

export {
    NotFoundError,
}