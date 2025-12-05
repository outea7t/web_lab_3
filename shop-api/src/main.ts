import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Shop API')
    .setDescription('API интернет-магазина')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const origin = process.env.WEB_ORIGIN || 'http://localhost:5173';

  app.enableCors({
    origin,
    credentials: true,
  });

  app.use(cookieParser());
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`SERVER IS UP AT PORT ${port}`);
}
bootstrap();
