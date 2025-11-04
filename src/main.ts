import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Serve static files from uploads directory
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/users/avatar/',
  });
  
  // Enable global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,               // drop unknown props
      forbidNonWhitelisted: true,    // 400 on unknown props
      transform: true,               // convert payloads to DTO instances
      transformOptions: { enableImplicitConversion: true }, // "2017" -> 2017
    }),
  );
  
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: false, // switch to true if you later move to cookies
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET','POST','PATCH','DELETE','OPTIONS'],
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
