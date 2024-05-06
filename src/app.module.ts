import { MiddlewareConsumer, Module } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { AuthMiddleware } from './middleware/auth.middleware';
import { LogMiddleware } from './middleware/log.middleware';
import { ProductModule } from './product/product.module';
import { UserController } from './user/user.controller';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    // JwtModule.register({
    //   secret: '',
    //   privateKey: '',
    //   signOptions: { expiresIn: '1h' },
    // }),
    UserModule,
    ProductModule,
    AuthModule,
    CommonModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(UserController);
    consumer.apply(cookieParser(), LogMiddleware).forRoutes('*');
  }
}
