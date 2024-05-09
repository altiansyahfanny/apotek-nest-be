import {
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  createParamDecorator,
} from '@nestjs/common';

export const Auth = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const email = request.headers.user;

    if (email) {
      return email;
    } else {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
  },
);
