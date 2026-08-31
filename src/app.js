const express = require('express');
require('dotenv').config()

const app = express();
// 3000
const port = process.env.PORT;
app.listen(port);

