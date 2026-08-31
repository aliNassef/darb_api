const appError = require('../../error/app_error');
const httpState = require('../../utils/http_state');
const E164 = /^\+[1-9]\d{7,14}$/;

const badRequest = (message) => {
    const err = appError.create(message, 400, httpState.FAILED);
};

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
