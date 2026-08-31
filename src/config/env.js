require('dotenv').config();

const required = ['AKEDLY_API_KEY', 'AKEDLY_PIPELINE_ID'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
    throw new Error(
        `Missing required environment variable(s): ${missing.join(', ')}. ` +
        `Add them to your .env file (see .env.example).`
    );
}

const toInt = (value, fallback) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const env = {
    akedlyApiKey: process.env.AKEDLY_API_KEY,
    akedlyPipelineID: process.env.AKEDLY_PIPELINE_ID,
    akedlyBaseUrl: (process.env.AKEDLY_BASE_URL || 'https://api.akedly.io/api/v1.2').replace(/\/+$/, ''),
    akedlyTimeoutMs: toInt(process.env.AKEDLY_TIMEOUT_MS, 10000),
    akedlyMaxPowDifficulty: toInt(process.env.AKEDLY_MAX_POW_DIFFICULTY, 5),
};

module.exports = env;
