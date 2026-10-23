require('dotenv').config();

const express = require('express');
const taskRoutes = require('./routes/tasks');
const sequelize = require('./config/database');
require('./models/Task');

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.use('/api/tasks', taskRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Unexpected server error' });
});

const port = process.env.PORT || 3000;

sequelize.sync()
  .then(() => {
    app.listen(port, () => {
      console.log(`API running at http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error('Database startup failed:', err);
    process.exit(1);
  });