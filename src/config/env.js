require('dotenv').config();

const appError = require('../error/app_error');
const httpstate = require('../utils/http_state');

const required = ['AKEDLY_API_KEY', 'AKEDLY_PIPELINE_ID'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
    throw appError.create(
        `Missing required environment variable(s): ${missing.join(', ')}. ` +
        `Add them to your .env file (see .env.example).`,
        500,
        httpstate.ERROR
    );
}

// Akedly pipeline IDs are Mongo ObjectIds. Checking the shape here turns a
// confusing upstream 500 ("Cast to ObjectId failed for value ... model Pipeline")
// into a clear startup failure.
if (!/^[0-9a-f]{24}$/i.test(process.env.AKEDLY_PIPELINE_ID)) {
    throw appError.create(
        `AKEDLY_PIPELINE_ID must be a 24-character hex ObjectId, got ` +
        `"${process.env.AKEDLY_PIPELINE_ID}". Copy the pipeline ID from your Akedly dashboard.`,
        500,
        httpstate.ERROR
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
