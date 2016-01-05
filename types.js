'use strict';

class ValidationError {
        constructor (originalError) {
                this.originalError = originalError;
        }

        toString () {
                return this.originalError.toString();
        }
}

function cast(type, value) {
        try {
                return type(value);
        } catch (e) {
                throw new ValidationError(e);
        }
}

exports.ValidationError = ValidationError;
exports.cast = cast;
