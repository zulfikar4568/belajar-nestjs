import { Handler, Context } from 'aws-lambda';
import { Server } from 'http';
import {
  createServer,
  proxy,
} from 'aws-serverless-express';
import { eventContext } from 'aws-serverless-express/middleware';
import { AppModule } from '../app.module';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';

import express from 'express';
import { INestApplication } from '@nestjs/common';
import {
  DocumentBuilder,
  SwaggerModule,
} from '@nestjs/swagger';

// NOTE: If you get ERR_CONTENT_DECODING_FAILED in your browser, this is likely
// due to a compressed response (e.g. gzip) which has not been handled correctly
// by aws-serverless-express and/or API Gateway. Add the necessary MIME types to
// binaryMimeTypes below
const binaryMimeTypes: string[] = [];

let cachedServer: Server;

function setupSwagger(app: INestApplication) {
  const option = {
    customCss: `
    .topbar-wrapper img {content:url(\'https://www.pngarts.com/files/2/Letter-Z-PNG-Image-Transparent.png'); width:100px; height:auto;}
    .swagger-ui .topbar { background-color: #fafafa; }`,
    customfavIcon:
      'https://www.pngarts.com/files/2/Letter-Z-PNG-Image-Transparent.png',
    customSiteTitle: 'Post API by Zulfikar',
  };

  const config = new DocumentBuilder()
    .setTitle('Blog Post API')
    .setDescription(
      'Ini adalah Post API dengan user Authentication sederhana by Zulfikar :)',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        // I was also testing it without prefix 'Bearer ' before the JWT
        description: `[just text field] Please enter token in following format: Bearer <JWT>`,
        name: 'Authorization',
        bearerFormat: 'Bearer', // I`ve tested not to use this field, but the result was the same
        scheme: 'Bearer',
        type: 'http', // I`ve attempted type: 'apiKey' too
        in: 'Header',
      },
      'access-token', // This name here is important for matching up with @ApiBearerAuth() in your controller!
    )
    .build();
  const document = SwaggerModule.createDocument(
    app,
    config,
  );
  SwaggerModule.setup(
    'api',
    app,
    document,
    option,
  );
}

async function bootstrapServer(): Promise<Server> {
  if (!cachedServer) {
    try {
      const expressApp = express();
      const nestApp = await NestFactory.create(
        AppModule,
        new ExpressAdapter(expressApp),
      );
      nestApp.use(eventContext());
      setupSwagger(nestApp);
      await nestApp.init();
      cachedServer = createServer(
        expressApp,
        undefined,
        binaryMimeTypes,
      );
    } catch (error) {
      return Promise.reject(error);
    }
  }
  return cachedServer;
}

export const handler: Handler = async (
  event: any,
  context: Context,
) => {
  if (event.path === '/api') {
    event.path = '/api/';
  }
  event.path = event.path.includes('swagger-ui')
    ? `/api${event.path}`
    : event.path;
  cachedServer = await bootstrapServer();
  return proxy(
    cachedServer,
    event,
    context,
    'PROMISE',
  ).promise;
};
