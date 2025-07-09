const express = require('express');
const cors = require('cors');
// // Routes
const playerRoutes = require('./routes/playerRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const matchRoutes = require('./routes/matchRoutes');
const changeLogRoutes = require('./routes/skillPointChangeLog'); // Đường dẫn tới file skillPointChangeLog.js

const dotenv = require('dotenv');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 8080;

dotenv.config();
connectDB(); // kết nối MongoDB

const app = express();

// Middleware
app.use(cors());
app.use(express.json());


app.use('/', (req, res) => {
    res.send('Xin chào, đây là API của Pickle Mate');
});
app.use('/api/players', playerRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/skill-point-change-logs', changeLogRoutes);

// Server start
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});