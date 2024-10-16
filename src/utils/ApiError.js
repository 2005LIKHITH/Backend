class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong", // Default message
        errors = [],
        stack = ""
    ) {
        super(message);
        this.statusCode = statusCode;
        this.data = null; // Only one assignment needed
        this.success = false; // Assuming success should be false for an error
        this.errors = errors;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export default ApiError;
