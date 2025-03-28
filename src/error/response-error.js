class ResponseError extends Error {
    constructor(status=400, message) {
        super(message);
        this.status = status;
        this.name = 'ResponseError'
    }
}

export {
    ResponseError,
}