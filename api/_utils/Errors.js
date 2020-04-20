class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message)
        this.statusCode = statusCode
        this.name = 'AppError'
        Error.captureStackTrace(this, AppError)
    }
}

class RequestError extends AppError {
    constructor(message, statusCode = 422) {
        super(message, statusCode)
        this.name = 'RequestError'
        this.statusCode = statusCode
        Error.captureStackTrace(this, RequestError)
    }
}

module.exports = { AppError, RequestError }
