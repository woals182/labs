import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // CORS 활성화

  // ✅ Swagger 설정 추가
  const config = new DocumentBuilder()
    .setTitle('환자 관리 API')
    .setDescription('환자 정보를 등록하고 조회하는 API 문서')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(3000, '0.0.0.0')
  console.log(`🚀 Server is running on http://localhost:3000`);
  console.log(`📄 Swagger API Docs available at http://localhost:3000/api-docs`);
}

bootstrap();
