const crypto = require('crypto');
const env = require('../config/env');

// Akedly's proof-of-work: find a nonce such that
// SHA256(`${challenge}:${nonce}`) starts with `difficulty` leading zero hex chars.
// Expected work is 16^difficulty hashes, so the cap below keeps this off the
// event loop for longer than a few hundred milliseconds.
const MAX_ITERATIONS = 50_000_000;

const solveChallenge = (challenge, difficulty) => {
    if (typeof challenge !== 'string' || challenge.length === 0) {
        const err = new Error('Akedly returned a challenge with no challenge string.');
        err.statusCode = 502;
        throw err;
    }

    if (!Number.isInteger(difficulty) || difficulty < 1) {
        const err = new Error(`Akedly returned an unusable PoW difficulty: ${difficulty}`);
        err.statusCode = 502;
        throw err;
    }

    if (difficulty > env.akedlyMaxPowDifficulty) {
        const err = new Error(
            `Akedly PoW difficulty ${difficulty} exceeds the configured maximum ` +
            `(${env.akedlyMaxPowDifficulty}). Solving it would block the server.`
        );
        err.statusCode = 502;
        throw err;
    }

    const prefix = '0'.repeat(difficulty);

    for (let nonce = 0; nonce < MAX_ITERATIONS; nonce += 1) {
        const digest = crypto.createHash('sha256').update(`${challenge}:${nonce}`).digest('hex');
        if (digest.startsWith(prefix)) {
            return nonce;
        }
    }

    const err = new Error(`Could not solve the Akedly PoW challenge within ${MAX_ITERATIONS} attempts.`);
    err.statusCode = 502;
    throw err;
};

module.exports = { solveChallenge };
