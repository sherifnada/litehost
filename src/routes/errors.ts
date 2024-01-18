interface ValidationErrorResponseBody {
    error: string, 
    message: string
    zipFileEntries?: any
}

class ValidationError extends Error {
    status: number;
    body: ValidationErrorResponseBody;

    constructor(status: number, body: ValidationErrorResponseBody) {
        super(body.message); // Call the constructor of the Error class.
        
        // Assign custom properties
        this.status = status;
        this.body = body;

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, ValidationError.prototype);

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ValidationError);
        }

        // Set the name of our error (this is optional and could be set to 'Error' if preferred)
        this.name = 'ValidationError';
    }
}

export {ValidationError, ValidationErrorResponseBody}