import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true, // Allow all origins reflected
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Paystack Wallet Service')
    .setDescription(
      'API documentation for Wallet Service with Paystack, JWT & API Keys',
    )
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT',
    )
    .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'API-Key')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 Paystack Wallet Service API is running!              ║
║                                                           ║
║   📝 API URL:      http://localhost:${process.env.PORT}                  ║
║   📚 Swagger UI:   http://localhost:${process.env.PORT}/api/docs         ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
}
bootstrap().catch((err) => {
  console.error('Error during bootstrap:', err);
});
