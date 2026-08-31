const express = require('express');
require('dotenv').config();
const authRouter = require('./features/auth/auth_router');
const app = express();



app.use(express.json());
app.set('trust proxy', 1);

app.use('/api/auth', authRouter);
app.use((req, res) => {
    res.status(404).json({
        status: httpStatusText.FAIL,
        message: 'Not Found Route'
    })
});

app.use((error, req, res, next) => {
    console.error(error.message);
    res.status(error.statusCode || 500).json({
        status: error.statusText || httpStatusText.FAIL,
        code: error.statusCode || 500,
        message: error.message
    })
})
// 3000
const port = process.env.PORT;
app.listen(port);

