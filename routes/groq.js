const express = require('express');
const bodyParser = require('body-parser');
const groqRoutes = require('./routes/groq');

const app = express();
app.use(bodyParser.json());

app.post('/sendMessage', groqRoutes.sendMessage);

app.listen(3001, () => console.log('Server running on port 3001'));
