import { NestFactory } from '@nestjs/core';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);

  app.enableCors({
    origin: 'http://localhost:5173',
    methods: 'GET, POST, DELETE, PUT, PATCH',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true,
  });

  app.setGlobalPrefix('api');

  await app.listen(5000);
}
bootstrap();
