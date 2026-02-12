import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import basicAuth from 'express-basic-auth';

export class SwaggerManager {
    static setup(app: INestApplication) {
        app.use(
            '/api/docs',
            basicAuth({
                challenge: true,
                users: {
                    admin: 'shifo',
                },
            }),
        );


        const config = new DocumentBuilder()
            .setTitle('Online Shifo API')
            .setDescription('Online Shifo backend API')
            .setVersion('1.0')
            .addBearerAuth()
            .build();

        const document = SwaggerModule.createDocument(app, config);

        SwaggerModule.setup('api/docs', app, document, {
            swaggerOptions: { persistAuthorization: true }
        });
    }
}
