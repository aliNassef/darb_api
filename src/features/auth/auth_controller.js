const AppError = require('../../core/utils/app_error');
const { solvePow } = require('../../core/utils/pow');
const akedly = require('./akedly_service');

const E164 = /^\+[1-9]\d{7,14}$/;

function asyncHandler(fn) {
    return (req, res, next) => fn(req, res, next).catch(next);
}

const requestOtp = asyncHandler(async (req, res) => {
    const { phoneNumber, turnstileToken } = req.body ?? {};

    if (!phoneNumber || !E164.test(phoneNumber)) {
        throw AppError.create(
            'phoneNumber is required in E.164 format, e.g. +201234567890',
            400,
            'fail',
        );
    }

    const challenge = await akedly.getChallenge();

    // Turnstile tokens must come from a widget rendered in the end user's
    // browser using this siteKey. The server never mints one.
    if (challenge.turnstile?.required && !turnstileToken) {
        return res.status(400).json({
            status: 'fail',
            message: 'This pipeline requires a Turnstile token.',
            data: { turnstile: { required: true, siteKey: challenge.turnstile.siteKey } },
        });
    }

    const nonce = solvePow(challenge.challenge, challenge.difficulty);

    const transaction = await akedly.sendOtp({
        phoneNumber,
        challengeToken: challenge.challengeToken,
        nonce,
        turnstileToken,
        endUserIp: req.ip,
    });

    res.status(200).json({
        status: 'success',
        data: {
            transactionReqID: transaction.transactionReqID,
            channels: transaction.channels,
            expiresAt: transaction.expiresAt,
        },
    });
});

const verifyOtp = asyncHandler(async (req, res) => {
    const { transactionReqID, otp } = req.body ?? {};

    if (!transactionReqID) {
        throw AppError.create('transactionReqID is required', 400, 'fail');
    }

    if (!otp || !/^\d{4,8}$/.test(String(otp))) {
        throw AppError.create('otp must be 4 to 8 digits', 400, 'fail');
    }

    const result = await akedly.verifyOtp({
        transactionReqID,
        otp: String(otp),
    });

    res.status(200).json({
        status: 'success',
        data: { verified: result.verified === true },
    });
});

module.exports = { requestOtp, verifyOtp };
