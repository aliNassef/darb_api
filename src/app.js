const express = require('express');
require('dotenv').config();
const authRouter = require('./features/auth/auth_router');
const app = express();



app.use(express.json());
app.set('trust proxy', 1);

app.use('/api/auth', authRouter);

// 3000
const port = process.env.PORT;
app.listen(port);

