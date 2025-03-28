import { ResponseError } from "./response-error";

class AuthorizationError extends ResponseError {
    constructor(message) {
        super(403, message);
        this.name = 'AuthorizationError';
    }
};

export {
    AuthorizationError,
};