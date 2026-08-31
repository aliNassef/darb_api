class AppError extends Error {
    constructor() {
        super();
    }

    create(message, statusCode, state) {
        this.message = message;
        this.statusCode = statusCode;
        this.state = state;
        return this;
    }
}

module.exports = new AppError();