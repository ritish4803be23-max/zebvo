const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const postsRoute = require('./routes/posts');
const exportRoutes = require('./routes/exportRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/export', exportRoutes);

connectDB();
app.use('/api/posts', postsRoute);

// Simple health
app.get('/api/health', (req, res) => res.json({ ok: true }));

const PORT = Number(process.env.PORT) || 5005;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop the process using it or change PORT in backend/.env.`);
    process.exit(1);
  }
  console.error('Server error:', err);
  process.exit(1);
});
