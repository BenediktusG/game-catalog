import { ResponseError } from "./response-error";

class AuthenticationError extends ResponseError {
    constructor(message) {
        super(401, message);
        this.name = 'AuthenticationError';
    }   
}

export {
    AuthenticationError,
}