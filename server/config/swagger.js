import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Gallery API",
      version: "1.0.0",
      description: "API documentation for Gallery project",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["./routes/*.js"], // Read documentation from route files
};

export const swaggerSpec = swaggerJsDoc(options);
export { swaggerUi };
