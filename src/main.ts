import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
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
    origin: ['http://localhost:5173'],
    credentials: false, // switch to true if you later move to cookies
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET','POST','PATCH','DELETE','OPTIONS'],
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
