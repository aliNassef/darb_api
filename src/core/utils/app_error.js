class AppError extends Error {
    constructor(message, statusCode, statusText) {
        super(message);
        this.statusCode = statusCode;
        this.statusText = statusText;
        Error.captureStackTrace(this, this.constructor);
    }

    static create(message, statusCode, statusText = 'error') {
        return new AppError(message, statusCode, statusText);
    }
}

module.exports = AppError;
