class AppError extends Error {
    constructor() {
        super();
    }

    create(message, statusCode, state) {
        this.message = message;
        this.statusCode = statusCode;
        this.state = state;
        // Refresh the stack on every create; otherwise it stays frozen at the
        // module-load `new AppError()` and points here instead of the throw site.
        Error.captureStackTrace(this, this.create);
        return this;
    }
}

module.exports = new AppError();
