import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://localhost:5173'],
    credentials: false, // switch to true if you later move to cookies
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET','POST','PATCH','DELETE','OPTIONS'],
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
