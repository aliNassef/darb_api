require('dotenv').config();
const express = require('express');

const authRoutes = require('./features/auth/auth_routes');

const app = express();

// Report the real client IP behind a proxy, for Akedly's x-end-user-ip.
app.set('trust proxy', 1);
app.use(express.json());

app.use('/api/auth', authRoutes);

app.use((req, res) => {
    res.status(404).json({
        status: 'fail',
        message: `Route ${req.method} ${req.originalUrl} not found`,
    });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    const statusCode = err.statusCode ?? 500;

    if (statusCode >= 500) {
        console.error(err);
    }

    res.status(statusCode).json({
        status: err.statusText ?? 'error',
        message:
            statusCode >= 500
                ? 'Something went wrong'
                : err.message,
    });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`darb_api listening on http://localhost:${port}`);
});

module.exports = app;
