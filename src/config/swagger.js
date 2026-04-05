const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title:       'Finance Dashboard API',
      version:     '1.0.0',
      description: 'A RESTful backend API for a finance dashboard system with role-based access control, financial record management, and summary analytics.',
    },
    servers: [
      {
        url: process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 5000}`,
        description: process.env.RENDER_EXTERNAL_URL ? 'Production server' : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type:         'http',
          scheme:       'bearer',
          bearerFormat: 'JWT',
          description:  'Enter your JWT token',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id:        { type: 'string',  example: '64f1a2b3c4d5e6f7a8b9c0d1' },
            name:      { type: 'string',  example: 'John Doe'                 },
            email:     { type: 'string',  example: 'john@example.com'         },
            role:      { type: 'string',  enum: ['viewer', 'analyst', 'admin'] },
            status:    { type: 'string',  enum: ['active', 'inactive']         },
            createdAt: { type: 'string',  example: '2024-01-01T00:00:00.000Z' },
          },
        },
        FinancialRecord: {
          type: 'object',
          properties: {
            _id:       { type: 'string',  example: '64f1a2b3c4d5e6f7a8b9c0d1' },
            amount:    { type: 'number',  example: 5000                        },
            type:      { type: 'string',  enum: ['income', 'expense']          },
            category:  { type: 'string',  example: 'salary'                    },
            date:      { type: 'string',  example: '2024-01-01T00:00:00.000Z' },
            notes:     { type: 'string',  example: 'January salary'            },
            createdBy: { type: 'object',  properties: {
              name:  { type: 'string', example: 'Admin User'        },
              email: { type: 'string', example: 'admin@example.com' },
            }},
            deletedAt: { type: 'string', nullable: true, example: null },
            createdAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true          },
            message: { type: 'string',  example: 'Success'     },
            data:    { type: 'object'                           },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false               },
            message: { type: 'string',  example: 'Something went wrong' },
            errors:  {
              type:  'array',
              items: {
                type: 'object',
                properties: {
                  field:   { type: 'string', example: 'email'                      },
                  message: { type: 'string', example: 'Please provide a valid email' },
                },
              },
            },
          },
        },
        PaginatedMeta: {
          type: 'object',
          properties: {
            total:      { type: 'integer', example: 100 },
            page:       { type: 'integer', example: 1   },
            limit:      { type: 'integer', example: 10  },
            totalPages: { type: 'integer', example: 10  },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);