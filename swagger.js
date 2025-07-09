// swagger.js
const swaggerJSDoc = require('swagger-jsdoc');

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
                url: 'http://localhost:8080', // hoặc domain thật khi deploy
            },
        ],
    },
    apis: ['./routes/*.js'], // Đường dẫn tới các file có swagger comment
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
