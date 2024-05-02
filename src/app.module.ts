import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import * as cookieParser from 'cookie-parser'; // Import cookie-parser
import { LogMiddleware } from './log/log.middleware';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { AuthMiddleware } from './auth/auth.middleware';
import { UserController } from './user/user.controller';

@Module({
  imports: [
    JwtModule.register({
      secret: '1234',
      privateKey: '5678',
      signOptions: { expiresIn: '1h' }, // Sesuaikan dengan waktu kedaluwarsa token
    }),
    WinstonModule.forRoot({
      format: winston.format.json(),
      level: 'debug',
      transports: [new winston.transports.Console()],
    }),
    UserModule,
    DatabaseModule,
    ProductModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    // consumer.apply(AuthMiddleware).forRoutes(UserController);
    consumer.apply(AuthMiddleware).forRoutes(UserController);
    consumer.apply(cookieParser(), LogMiddleware).forRoutes('*');
  }
}
