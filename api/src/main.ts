import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { config } from 'aws-sdk';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.enableCors();

config.update({
  accessKeyId:  process.env.AWS_IAM_ACCESS_KEY,
  secretAccessKey: process.env.AWS_IAM_SECRET_KEY,
  region: process.env.AWS_REGION,
});

  await app.listen(process.env.NODE_PORT);
}
bootstrap();
