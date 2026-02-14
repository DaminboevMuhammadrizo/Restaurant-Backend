import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerManager } from './common/config/swager';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.setGlobalPrefix('api');

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    SwaggerManager.setup(app);

    await app.listen(process.env.PORT || 3000, '0.0.0.0');

    console.log("\x1b[32m%s\x1b[0m", `Server running on http://localhost:${process.env.PORT || 3000}`);
    console.log("\x1b[32m%s\x1b[0m", `Swagger: http://localhost:${process.env.PORT || 3000}/api/docs`);
}

bootstrap();
