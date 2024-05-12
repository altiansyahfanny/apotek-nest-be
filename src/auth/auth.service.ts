import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { MailService } from 'src/common/mail.service';
import { PrismaService } from 'src/common/prisma.service';
import { TokenService } from 'src/common/token.service';
import { ValidationService } from 'src/common/validation.service';
import { Logger } from 'winston';
import {
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
} from '../model/auth.model';
import { AuthValidation } from './auth.validation';

@Injectable()
export class AuthService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
    private validationService: ValidationService,
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
      throw new HttpException(
        'Email or password is invalid',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const isActive = await this.prismaService.user.findFirst({
      where: { email: LoginRequest.email, isActive: true },
    });

    if (!isActive) {
      throw new HttpException('Email unverified', HttpStatus.UNAUTHORIZED);
    }

    const isPasswordValid = await bcrypt.compare(
      LoginRequest.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new HttpException(
        'Email or password is invalid',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return this.tokenService.login(user);
  }

  async refresh(token: string) {
    return await this.tokenService.refresh(token);
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
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
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
      throw new HttpException(
        'Email already registered',
        HttpStatus.BAD_REQUEST,
      );
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
      throw new HttpException(
        'Failed to register user',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async forgotPassword(request: ForgotPasswordRequest) {
    const forgotPassword: ForgotPasswordRequest =
      this.validationService.validate(AuthValidation.FORGOT_PASSWORD, request);

    const user = await this.prismaService.user.findFirst({
      where: { email: forgotPassword.email, isActive: true },
    });

    if (!user) {
      throw new HttpException('Email not registered', HttpStatus.BAD_REQUEST);
    }

    await this.mailService.forgotPassword(user.email);

    return {
      email: user.email,
      name: user.name,
    };
  }

  async resetPassword(request: ResetPasswordRequest) {
    const resetPassword: ResetPasswordRequest = this.validationService.validate(
      AuthValidation.RESET_PASSWORD,
      request,
    );

    const email = await this.tokenService.verifyResetPassword(
      resetPassword.token,
    );

    const user = await this.prismaService.user.findFirst({
      where: { email },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }

    const hashPassword = await bcrypt.hash(resetPassword.password, 10);

    const updatedUser = await this.prismaService.user.update({
      data: { password: hashPassword },
      where: { email },
    });

    return {
      email: updatedUser.email,
      name: updatedUser.name,
    };
  }
}
