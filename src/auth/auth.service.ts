import { HttpException, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from '../model/auth.model';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { AuthValidation } from './auth.validation';
import * as bcrypt from 'bcrypt';
import { MailService } from 'src/common/mail/mail.service';
import { TokenService } from 'src/common/token/token.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prismaService: PrismaService,
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private mailService: MailService,
    private tokenService: TokenService,
  ) {}

  async login(request: LoginRequest) {
    const LoginRequest: LoginRequest = this.validationService.validate(
      AuthValidation.LOGIN,
      request,
    );

    const user = await this.prismaService.user.findUnique({
      where: { email: LoginRequest.email },
    });

    if (!user) {
      throw new HttpException('Email or password is invalid', 401);
    }

    const isActive = await this.prismaService.user.findFirst({
      where: { email: LoginRequest.email, isActive: true },
    });

    if (!isActive) {
      throw new HttpException('Email unverified', 401);
    }

    const isPasswordValid = await bcrypt.compare(
      LoginRequest.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new HttpException('Email or password is invalid', 401);
    }

    const access_token = this.jwtService.sign(
      {
        user,
      },
      {
        secret: '1234',
        privateKey: '5678',
        expiresIn: '60m',
      },
    );

    const refresh_token = this.jwtService.sign(
      {
        email: user.email,
      },
      {
        secret: '1234',
        privateKey: '5678',
        expiresIn: '1h',
      },
    );

    return { access_token, refresh_token };
  }

  async refresh(token: string) {
    try {
      const decoded = await this.jwtService.verify(token, { secret: '1234' });
      const { exp, iat, ...payload } = decoded;
      const newToken = this.jwtService.sign(payload, { secret: '1234' });
      return newToken;
    } catch (error) {
      console.log('error: ', error);
      throw new HttpException('Failed to refresh', 401);
    }
  }

  async verificationEmail(token: string) {
    const email: string = await this.tokenService.verify(token);

    if (email) {
      const user = await this.prismaService.user.update({
        data: { isActive: true },
        where: { email },
      });
      return { message: 'Verified', data: user };
    } else {
      throw new HttpException('Invalid token', 401);
    }
  }

  async register(request: RegisterRequest): Promise<AuthResponse> {
    this.logger.info(`Register new user : ${JSON.stringify(request)}`);

    const registerRequest: RegisterRequest = this.validationService.validate(
      AuthValidation.REGISTER,
      request,
    );

    const totalUserWithSameEmail = await this.prismaService.user.count({
      where: { email: registerRequest.email },
    });

    if (totalUserWithSameEmail != 0) {
      throw new HttpException('Email already registered', 400);
    }

    registerRequest.password = await bcrypt.hash(registerRequest.password, 10);

    const user = await this.prismaService.user.create({
      data: registerRequest,
    });

    // send verification email
    const emailSent = await this.mailService.verification(user.email);

    if (emailSent) {
      return {
        email: user.email,
        name: user.name,
      };
    } else {
      await this.prismaService.user.delete({
        where: { email: user.email },
      });
      throw new HttpException('Failed to register user', 400);
    }
  }
}
