import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { ErrorFilter } from './error.filter';
import { mailerConfig } from '../config/mail.config';
import { MailService } from './mail.service';
import { PrismaService } from './prisma.service';
import { TokenService } from './token.service';
import { ValidationService } from './validation.service';

@Module({
  imports: [
    WinstonModule.forRoot({
      format: winston.format.json(),
      level: 'debug',
      transports: [new winston.transports.Console()],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MailerModule.forRoot(mailerConfig),
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ErrorFilter,
    },
    ValidationService,
    PrismaService,
    MailService,
    TokenService,
    JwtService,
  ],
  exports: [
    ValidationService,
    PrismaService,
    MailService,
    TokenService,
    JwtService,
  ],
})
export class CommonModule {}
