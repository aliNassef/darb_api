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

// Akedly transaction IDs are Mongo ObjectIds, same shape as the pipeline ID.
const OBJECT_ID = /^[0-9a-f]{24}$/i;

const validateTransactionReqID = (value) => {
    if (value === undefined || value === null || value === '') {
        throw badRequest('transactionReqID is required.');
    }

    if (typeof value !== 'string') {
        throw badRequest('transactionReqID must be a string.');
    }

    const transactionReqID = value.trim();

    if (!OBJECT_ID.test(transactionReqID)) {
        throw badRequest('transactionReqID must be a 24-character hex ObjectId.');
    }

    return transactionReqID;
};

// Length is coupled to `digits: 6` in akedly_client.sendOtp.
const OTP = /^\d{6}$/;

const validateOtp = (value) => {
    if (value === undefined || value === null || value === '') {
        throw badRequest('otp is required.');
    }

    // A numeric OTP silently loses a leading zero (012345 -> 12345), which would
    // verify against the wrong code, so require it quoted.
    if (typeof value !== 'string') {
        throw badRequest('otp must be a string, e.g. "012345" — quote it so a leading zero is preserved.');
    }

    const otp = value.trim();

    if (!OTP.test(otp)) {
        throw badRequest('otp must be exactly 6 digits.');
    }

    return otp;
};

module.exports = { validatePhoneNumber, validateTransactionReqID, validateOtp };
