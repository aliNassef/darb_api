const express = require('express');
require('dotenv').config();
const authRouter = require('./features/auth/auth_router');
const httpstate = require('./utils/http_state');
const app = express();



app.use(express.json());
app.set('trust proxy', 1);

app.use('/api/auth', authRouter);
app.use((req, res) => {
    res.status(404).json({
        status: httpstate.FAILED,
        message: 'Not Found Route'
    })
});

app.use((error, req, res, next) => {
    const statusCode = error.statusCode || error.status || 500;
    console.error(error.message);
    res.status(statusCode).json({
        status: error.state || httpstate.ERROR,
        code: statusCode,
        message: error.message
    })
})
// 3000
const port = process.env.PORT;
app.listen(port, () => {
    console.log('server is running');
});
