// swagger.js
const swaggerJSDoc = require('swagger-jsdoc');
require('dotenv').config();
// const DOMAIN = process.env.DOMAIN
const DOMAIN = "http://localhost:8080"

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'PickleMate API Documentation',
            version: '1.0.0',
            description: '',
        },
        servers: [
            {
                url: DOMAIN, // hoặc domain thật khi deploy
            },
        ],
    },
    apis: ['./routes/*.js'], // Đường dẫn tới các file có swagger comment
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
