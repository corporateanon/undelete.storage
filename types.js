'use strict';

const tFromJSON = require('tcomb/lib/fromJSON');

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

function fromJSON(type, value) {
  try {
    return tFromJSON(value, type);
  } catch (e) {
    throw new ValidationError(e);
  }
}

exports.ValidationError = ValidationError;
exports.cast = cast;
exports.fromJSON = fromJSON;
