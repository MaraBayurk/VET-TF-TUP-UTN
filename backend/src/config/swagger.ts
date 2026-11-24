import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';

const vercelDomain = process.env.VERCEL_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL;
const swaggerServerUrl = process.env.API_BASE_URL ||
    (vercelDomain ? `https://${vercelDomain}` : 'http://localhost:3000');

const options: swaggerJSDoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Veterinaria - TF TUP UTN',
            version: '1.0.0',
            description: 'Documentación interactiva de la API REST.',
        },
        servers: [
            {
                url: swaggerServerUrl,
                description: vercelDomain ? 'Servidor desplegado' : 'Servidor Local',
            },
        ],
        components: {
            schemas: {
                ApiEnvelope: {
                    type: 'object',
                    required: ['status'],
                    properties: {
                        status: {
                            type: 'string',
                            enum: ['success', 'error'],
                        },
                        message: { type: 'string' },
                        data: {},
                    },
                    description: 'Formato común de las respuestas de la API.',
                },
            },
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [{ bearerAuth: [] }],
    },
    apis: ['./src/modules/**/*.routes.ts'],
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app: Application) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    console.log(`📄 Swagger Docs disponible en ${swaggerServerUrl}/api-docs`);
};
