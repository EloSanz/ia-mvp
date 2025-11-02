/**
 * Swagger configuration for iCards API
 */

import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'iCards API',
      version: '1.0.0',
      description: 'API for flashcard management system with AI-powered features',
      contact: {
        name: 'iCards Team',
        email: 'support@icards.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://api.icards.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme. Example: "Authorization: Bearer {token}"'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message'
            },
            errors: {
              type: 'array',
              items: {
                type: 'string'
              }
            }
          }
        },
        Deck: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            name: {
              type: 'string',
              example: 'Spanish Vocabulary'
            },
            description: {
              type: 'string',
              example: 'Basic Spanish words and phrases'
            },
            coverUrl: {
              type: 'string',
              example: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABA...'
            },
            userId: {
              type: 'integer',
              example: 1
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00.000Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T11:00:00.000Z'
            },
            stats: {
              type: 'object',
              properties: {
                flashcardsCount: {
                  type: 'integer',
                  example: 50
                },
                newFlashcardsCount: {
                  type: 'integer',
                  example: 20
                },
                revisionsCount: {
                  type: 'integer',
                  example: 30
                }
              }
            }
          }
        },
        DeckMCP: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            name: {
              type: 'string',
              example: 'Spanish Vocabulary'
            },
            description: {
              type: 'string',
              example: 'Basic Spanish words and phrases'
            },
            userId: {
              type: 'integer',
              example: 1
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00.000Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T11:00:00.000Z'
            },
            stats: {
              type: 'object',
              properties: {
                flashcardsCount: {
                  type: 'integer',
                  example: 50
                },
                newFlashcardsCount: {
                  type: 'integer',
                  example: 20
                },
                revisionsCount: {
                  type: 'integer',
                  example: 30
                }
              }
            }
          }
        },
        Flashcard: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            front: {
              type: 'string',
              example: 'Hello'
            },
            back: {
              type: 'string',
              example: 'Hola'
            },
            deckId: {
              type: 'integer',
              example: 1
            },
            difficulty: {
              type: 'integer',
              minimum: 1,
              maximum: 3,
              example: 2
            },
            reviewCount: {
              type: 'integer',
              example: 5
            },
            correctCount: {
              type: 'integer',
              example: 4
            },
            nextReview: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-20T10:30:00.000Z'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00.000Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T11:00:00.000Z'
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['greeting', 'basic']
            }
          }
        },
        Tag: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            name: {
              type: 'string',
              example: 'Grammar'
            },
            color: {
              type: 'string',
              example: '#FF6B6B'
            },
            deckId: {
              type: 'integer',
              example: 1
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00.000Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T11:00:00.000Z'
            }
          }
        },
        CreateDeckRequest: {
          type: 'object',
          required: ['name'],
          properties: {
            name: {
              type: 'string',
              minLength: 1,
              maxLength: 100,
              example: 'Spanish Vocabulary'
            },
            description: {
              type: 'string',
              maxLength: 500,
              example: 'Basic Spanish words and phrases'
            },
            generateCover: {
              type: 'boolean',
              default: false,
              example: true
            }
          }
        },
        UpdateDeckRequest: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              minLength: 1,
              maxLength: 100,
              example: 'Advanced Spanish'
            },
            description: {
              type: 'string',
              maxLength: 500,
              example: 'Advanced Spanish vocabulary'
            }
          }
        },
        CreateFlashcardRequest: {
          type: 'object',
          required: ['front', 'back', 'deckId'],
          properties: {
            front: {
              type: 'string',
              minLength: 1,
              maxLength: 1000,
              example: 'Hello'
            },
            back: {
              type: 'string',
              minLength: 1,
              maxLength: 1000,
              example: 'Hola'
            },
            deckId: {
              type: 'integer',
              example: 1
            },
            difficulty: {
              type: 'integer',
              minimum: 1,
              maximum: 3,
              default: 2,
              example: 2
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['greeting', 'basic']
            }
          }
        },
        CreateTagRequest: {
          type: 'object',
          required: ['name', 'deckId'],
          properties: {
            name: {
              type: 'string',
              minLength: 1,
              maxLength: 50,
              example: 'Grammar'
            },
            color: {
              type: 'string',
              pattern: '^#[0-9A-Fa-f]{6}$',
              example: '#FF6B6B'
            },
            deckId: {
              type: 'integer',
              example: 1
            }
          }
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js'
  ]
};

const specs = swaggerJSDoc(options);

export { swaggerUi, specs };
