const crypto = require('crypto');
const env = require('../config/env');
const appError = require('../error/app_error');
const httpstate = require('../utils/http_state');

// Akedly's proof-of-work: find a nonce such that
// SHA256(`${challenge}:${nonce}`) starts with `difficulty` leading zero hex chars.
// Expected work is 16^difficulty hashes, so the cap below keeps this off the
// event loop for longer than a few hundred milliseconds.
const MAX_ITERATIONS = 50_000_000;

const solveChallenge = (challenge, difficulty) => {
    if (typeof challenge !== 'string' || challenge.length === 0) {
        throw appError.create('Akedly returned a challenge with no challenge string.', 502, httpstate.ERROR);
    }

    if (!Number.isInteger(difficulty) || difficulty < 1) {
        throw appError.create(
            `Akedly returned an unusable PoW difficulty: ${difficulty}`,
            502,
            httpstate.ERROR
        );
    }

    if (difficulty > env.akedlyMaxPowDifficulty) {
        throw appError.create(
            `Akedly PoW difficulty ${difficulty} exceeds the configured maximum ` +
            `(${env.akedlyMaxPowDifficulty}). Solving it would block the server.`,
            502,
            httpstate.ERROR
        );
    }

    const prefix = '0'.repeat(difficulty);

    for (let nonce = 0; nonce < MAX_ITERATIONS; nonce += 1) {
        const digest = crypto.createHash('sha256').update(`${challenge}:${nonce}`).digest('hex');
        if (digest.startsWith(prefix)) {
            return nonce;
        }
    }

    throw appError.create(
        `Could not solve the Akedly PoW challenge within ${MAX_ITERATIONS} attempts.`,
        502,
        httpstate.ERROR
    );
};

module.exports = { solveChallenge };
