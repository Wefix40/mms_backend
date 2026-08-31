import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule, OpenAPIObject } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('MMS Backend API')
    .setDescription('Automated Global Swagger Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  applyGlobalSettingsToDocument(document);

  const customOptions = {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'MMS API Docs',
  };

  SwaggerModule.setup('api-docs', app, document, customOptions);
}

function applyGlobalSettingsToDocument(document: OpenAPIObject) {
  const globalResponses = {
    '400': { description: 'Bad Request - Invalid input data' },
    '401': { description: 'Unauthorized - Missing or invalid token' },
    '403': { description: 'Forbidden - Insufficient permissions' },
    '500': { description: 'Internal Server Error' },
  };

  const globalParameters = [
    {
      name: 'Accept-Language',
      in: 'header',
      description: 'The locale you want the responses in (e.g., en, es)',
      required: false,
      schema: { type: 'string', default: 'en' },
    },
  ];

  for (const path in document.paths) {
    for (const method in document.paths[path]) {
      const operation = (document.paths[path] as any)[method];

      if (operation) {
        operation.responses = {
          ...globalResponses,
          ...operation.responses,
        };

        operation.parameters = [
          ...(operation.parameters || []),
          ...globalParameters,
        ] as any;

        operation.security = [{ bearer: [] }];
      }
    }
  }
}
