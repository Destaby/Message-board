const express = require('express');
const api = require('./api/api');

const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.json());

app.use('/api', api);

app.listen(PORT);
