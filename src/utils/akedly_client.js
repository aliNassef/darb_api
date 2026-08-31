const env = require('../config/env');
const appError = require('../error/app_error');
const httpstate = require('../utils/http_state');

const normalizeIp = (ip) => {
    if (typeof ip !== 'string' || ip.length === 0) return null;

    const address = ip.startsWith('::ffff:') ? ip.slice(7) : ip;

    if (address === '::1' || address === '0.0.0.0' || address === '::') return null;
    if (/^127\./.test(address)) return null;
    if (/^10\./.test(address)) return null;
    if (/^192\.168\./.test(address)) return null;
    if (/^172\.(1[6-9]|2\d|3[01])\./.test(address)) return null;
    if (/^169\.254\./.test(address)) return null;
    if (/^f[cd][0-9a-f]{2}:/i.test(address)) return null;
    if (/^fe[89ab][0-9a-f]:/i.test(address)) return null;

    return address;
};


const request = async (path, { method = 'GET', headers = {}, body } = {}) => {
    let response;
    try {
        response = await fetch(`${env.akedlyBaseUrl}${path}`, {
            method,
            headers,
            body,
            signal: AbortSignal.timeout(env.akedlyTimeoutMs),
        });
    } catch (err) {
        if (err.name === 'TimeoutError' || err.name === 'AbortError') {
            throw appError.create(
                `Akedly did not respond within ${env.akedlyTimeoutMs}ms.`,
                504,
                httpstate.ERROR
            );
        }
        throw appError.create(`Could not reach Akedly: ${err.message}`, 502, httpstate.ERROR);
    }

    const text = await response.text();

    let parsed;
    try {
        parsed = text.length > 0 ? JSON.parse(text) : {};
    } catch {
        throw appError.create(
            `Akedly returned a non-JSON response (HTTP ${response.status}).`,
            502,
            httpstate.ERROR
        );
    }

    return { status: response.status, body: parsed };
};

const getChallenge = async () => {
    const query = new URLSearchParams({
        APIKey: env.akedlyApiKey,
        pipelineID: env.akedlyPipelineID,
    });

    const { status, body } = await request(`/transactions/challenge?${query}`);

    if (status < 200 || status >= 300) {
        throw appError.create(
            `Akedly rejected the challenge request (HTTP ${status})` +
            `${body?.message ? `: ${body.message}` : ''}.`,
            502,
            httpstate.ERROR
        );
    }

    if (!body?.data) {
        throw appError.create('Akedly returned a challenge response with no data.', 502, httpstate.ERROR);
    }

    return body.data;
};

const sendOtp = async ({ phoneNumber, powSolution, endUserIp }) => {
    const headers = { 'Content-Type': 'application/json' };
    if (endUserIp) {
        headers['x-end-user-ip'] = endUserIp;
    }

    const payload = {
        APIKey: env.akedlyApiKey,
        pipelineID: env.akedlyPipelineID,
        verificationAddress: { phoneNumber },
        digits: 6,
    };

    if (powSolution) {
        payload.powSolution = powSolution;
    }

    return request('/transactions/send', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
    });
};

// Verify needs no APIKey/pipelineID/PoW — possession of the transaction ID is
// what authenticates the call.
const verifyOtp = async ({ transactionReqID, otp }) =>
    request('/transactions/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionReqID, otp }),
    });

module.exports = { getChallenge, sendOtp, verifyOtp, normalizeIp };
