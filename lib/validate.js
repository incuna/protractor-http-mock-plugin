'use strict';

class HttpMockValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'HttpMockValidationError';
    }
}

const validate = function (mock) {
    let valid = true;

    /* eslint-disable no-console */
    const mockType = typeof mock;
    if (!mock || (mockType !== 'object' && mockType !== 'string')) {
        console.error('Invalid mock: must be an object or string');
        valid = false;
    } else if (mockType === 'string') {
        valid = true;
    } else {
        if (!mock.request) {
            console.error('Invalid mock object: must have a request property');
            valid = false;
        }
        if (!mock.response) {
            console.error('Invalid mock object: must have a response property');
            valid = false;
        }
    }

    if (!valid) {
        console.log(mock);
    }
    /* eslint-enable no-console */

    return valid;
};

exports.single = function (mock) {
    return validate(mock);
};

exports.singleForBrowser = function (mock) {
    if (typeof mock === 'string') {
        /* eslint-disable no-console */
        console.error('Invalid mock for browser: cannot be string');
        /* eslint-enable no-console */
        return false;
    }
    return validate(mock);
};

exports.many = function (mocks) {
    const valid = mocks.map(exports.single).every((isValid) => isValid);
    if (!valid) {
        throw new HttpMockValidationError('Invalid mocks');
    }
    return valid;
};

exports.manyForBrowser = function (mocks) {
    const valid = mocks.map(exports.singleForBrowser).every((isValid) => isValid);
    if (!valid) {
        throw new HttpMockValidationError('Invalid mocks for the browser: must be an inline request/response object');
    }
    return valid;
};
