import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true
  }));

  const option = {
    customCss: `
    .topbar-wrapper img {content:url(\'https://www.pngarts.com/files/2/Letter-Z-PNG-Image-Transparent.png'); width:100px; height:auto;}
    .swagger-ui .topbar { background-color: #fafafa; }`,
    customfavIcon: 'https://www.pngarts.com/files/2/Letter-Z-PNG-Image-Transparent.png',
    customSiteTitle: 'Post API by Zulfikar'
  }

  const config = new DocumentBuilder()
    .setTitle('Blog Post API')
    .setDescription('Ini adalah Post API dengan user Authentication sederhana by Zulfikar :)')
    .setVersion('1.0.0')
    .addBearerAuth(
      { 
        // I was also testing it without prefix 'Bearer ' before the JWT
        description: `[just text field] Please enter token in following format: Bearer <JWT>`,
        name: 'Authorization',
        bearerFormat: 'Bearer', // I`ve tested not to use this field, but the result was the same
        scheme: 'Bearer',
        type: 'http', // I`ve attempted type: 'apiKey' too
        in: 'Header'
      },
      'access-token', // This name here is important for matching up with @ApiBearerAuth() in your controller!
    )
    .build()

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/', app, document, option);

  await app.listen(3000);
}
bootstrap();
