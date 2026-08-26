const crypto = require('crypto');
const AppError = require('./app_error');

// Akedly's proof of work: find a nonce such that
// sha256(`${challenge}:${nonce}`) starts with `difficulty` zeros.
// At difficulty 4 this averages ~65k hashes, a few milliseconds.
const MAX_ITERATIONS = 5_000_000;

function solvePow(challenge, difficulty) {
    const prefix = '0'.repeat(difficulty);

    for (let nonce = 0; nonce < MAX_ITERATIONS; nonce++) {
        const hash = crypto
            .createHash('sha256')
            .update(`${challenge}:${nonce}`)
            .digest('hex');

        if (hash.startsWith(prefix)) {
            return nonce;
        }
    }

    throw AppError.create(
        `Could not solve the Akedly proof of work at difficulty ${difficulty}`,
        502,
    );
}

module.exports = { solvePow };
