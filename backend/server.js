require('dotenv').config();
const express = require('express');
const cors = require('cors');

require('./database');

const tasksRoutes = require('./routes/tasks');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (_, res) => {
  res.json({ status: 'ok' });
});

app.use('/tasks', tasksRoutes);

app.listen(port, () => {
  console.log(`Backend rodando em http://localhost:${port}`);
});
