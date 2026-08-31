const akedly = require('../../utils/akedly_client');
const httpstate = require('../../utils/http_state');
const { solveChallenge } = require('../../utils/pow');
const { validatePhoneNumber } = require('./auth_validator');
const appError = require('../../error/app_error');
const asyncWrapper = require('../../middleware/async_wrapper');
// No global error middleware is registered, so every path out of this handler
// must terminate the response itself.
const sendOtp = asyncWrapper(async (req, res, next) => {

    const phoneNumber = validatePhoneNumber(req.body?.phoneNumber);

    const challenge = await akedly.getChallenge();

    if (challenge.turnstile?.required === true) {
        const err = appError.create('there is something wrong', 501, httpstate.ERROR);
        next(err);
    }

    const powSolution = challenge.challengeRequired === false
        ? undefined
        : {
            challengeToken: challenge.challengeToken,
            nonce: solveChallenge(challenge.challenge, challenge.difficulty),
        };

    const { status, body } = await akedly.sendOtp({
        phoneNumber,
        powSolution,
        endUserIp: akedly.normalizeIp(req.ip),
    });

    if (status < 200 || status >= 300) {
        return res.status(status).json({
            status: httpstate.ERROR,
            code: body?.code,
            message: body?.message || 'Akedly rejected the OTP request.',
            retryAfter: body?.retryAfter,
        });
    }

    return res.status(200).json({
        status: httpstate.SUCCESS,
        data: {
            transactionReqID: body?.data?.transactionReqID,
            channels: body?.data?.channels,
            expiresAt: body?.data?.expiresAt,
        },
    });

});

module.exports = {
    sendOtp,
};
