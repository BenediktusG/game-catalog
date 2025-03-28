import { ResponseError } from "./response-error";

class ConflictError extends ResponseError {
    constructor(message) {
        super(409, message);
        this.name = 'ConflictError';
    }
}

export {
    ConflictError,
}