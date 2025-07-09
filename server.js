const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css"
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


app.get('/', (req, res) => {
    res.redirect('/api-docs');
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss:
        '.swagger-ui .opblock .opblock-summary-path-description-wrapper { align-items: center; display: flex; flex-wrap: wrap; gap: 0 10px; padding: 0 10px; width: 100%; }',
    customCssUrl: CSS_URL,
}
))
app.use('/api/players', playerRoutes);

app.use('/api/matches', matchRoutes);
app.use('/api/skill-point-change-logs', changeLogRoutes);

// Server start
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
}); app.use('/api/sessions', sessionRoutes);