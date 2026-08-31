const akedly = require('../../utils/akedly_client');
const httpstate = require('../../utils/http_state');
const { solveChallenge } = require('../../utils/pow');
const { validatePhoneNumber, validateTransactionReqID, validateOtp } = require('./auth_validator');
const appError = require('../../error/app_error');
const asyncWrapper = require('../../middleware/async_wrapper');

const sendOtp = asyncWrapper(async (req, res) => {
    const phoneNumber = validatePhoneNumber(req.body?.phoneNumber);

    const challenge = await akedly.getChallenge();



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


const verifyOtp = asyncWrapper(async (req, res) => {
    const transactionReqID = validateTransactionReqID(req.body?.transactionReqID);
    const otp = validateOtp(req.body?.otp);

    const { status, body } = await akedly.verifyOtp({ transactionReqID, otp });

    if (status < 200 || status >= 300) {
        return res.status(status).json({
            status: httpstate.ERROR,
            code: body?.code,
            message: body?.message || 'Akedly rejected the OTP verification.',
        });
    }

    if (body?.data?.verified !== true) {
        return res.status(403).json({
            status: httpstate.ERROR,
            code: body?.code || 'INVALID_OTP',
            message: body?.message || 'OTP could not be verified.',
        });
    }

    return res.status(200).json({
        status: httpstate.SUCCESS,
        data: {
            verified: true,
            transactionID: body?.data?.transactionID,
        },
    });

});




module.exports = {
    sendOtp,
    verifyOtp
};
