const AppError = require('../../core/utils/app_error');

const AKEDLY_BASE_URL = 'https://api.akedly.io/api/v1.2';

// Read at call time so dotenv.config() in app.js is guaranteed to have run.
function credentials() {
    const apiKey = process.env.AKEDLY_API_KEY;
    const pipelineID = process.env.AKEDLY_ID;

    if (!apiKey || !pipelineID) {
        throw AppError.create(
            'AKEDLY_API_KEY and AKEDLY_ID must be set in the environment',
            500,
        );
    }

    return { apiKey, pipelineID };
}

async function request(path, options = {}) {
    const response = await fetch(`${AKEDLY_BASE_URL}${path}`, options);

    let body;
    try {
        body = await response.json();
    } catch {
        body = null;
    }

    if (!response.ok) {
        throw AppError.create(
            body?.message ?? `Akedly request to ${path} failed`,
            response.status,
            'fail',
        );
    }

    return body;
}

async function requestVerify(path, options) {
    try {
        return await request(path, options);
    } catch (err) {
        if (err.statusCode >= 500 && err.message) {
            throw AppError.create(err.message, 400, 'fail');
        }
        throw err;
    }
}

async function getChallenge() {
    const { apiKey, pipelineID } = credentials();
    const query = new URLSearchParams({ APIKey: apiKey, pipelineID });

    const body = await request(`/transactions/challenge?${query}`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
    });

    return body.data;
}

async function sendOtp({
    phoneNumber,
    challengeToken,
    nonce,
    turnstileToken,
    endUserIp,
    digits = 6,
}) {
    const { apiKey, pipelineID } = credentials();

    const headers = { 'Content-Type': 'application/json' };
    if (endUserIp) {
        headers['x-end-user-ip'] = endUserIp;
    }

    const payload = {
        APIKey: apiKey,
        pipelineID,
        verificationAddress: { phoneNumber },
        powSolution: { challengeToken, nonce },
        digits,
    };

    if (turnstileToken) {
        payload.turnstileToken = turnstileToken;
    }

    const body = await request('/transactions/send', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
    });

    return body.data;
}

// /transactions/verify only fails for client reasons (wrong code, unknown or
// expired transaction), but Akedly reports them as HTTP 500 with a usable
// message. Surface those as 4xx so callers get something actionable.
async function verifyOtp({ transactionReqID, otp }) {
    const body = await requestVerify('/transactions/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionReqID, otp }),
    });

    return body.data;
}

module.exports = { getChallenge, sendOtp, verifyOtp };
