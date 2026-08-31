const appError = require('../../error/app_error');
const httpstate = require('../../utils/http_state');

// E.164: a leading '+', a non-zero country digit, then 7-14 more digits.
const E164 = /^\+[1-9]\d{7,14}$/;

const badRequest = (message) => appError.create(message, 400, httpstate.FAILED);

const validatePhoneNumber = (value) => {
    if (value === undefined || value === null || value === '') {
        throw badRequest('phoneNumber is required.');
    }

    if (typeof value !== 'string') {
        throw badRequest('phoneNumber must be a string.');
    }

    const phoneNumber = value.trim();

    if (!E164.test(phoneNumber)) {
        throw badRequest('phoneNumber must be in E.164 format, e.g. +201554442491.');
    }

    return phoneNumber;
};

module.exports = { validatePhoneNumber };
