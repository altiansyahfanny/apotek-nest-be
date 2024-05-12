import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';

@Injectable()
export class TokenService {
  constructor(private jwtService: JwtService) {}

  async login(user: User) {
    try {
      const access_token = this.jwtService.sign(
        {
          user: user.email,
        },
        {
          secret: process.env.ACCESS_TOKEN_SECRET,
          privateKey: process.env.ACCESS_TOKEN_SECRET,
          expiresIn: '60m',
        },
      );

      const refresh_token = this.jwtService.sign(
        {
          user: user.email,
        },
        {
          secret: process.env.REFRESH_TOKEN_SECRET,
          privateKey: process.env.REFRESH_TOKEN_SECRET,
          expiresIn: '24h',
        },
      );

      return { access_token, refresh_token };
    } catch (error) {
      throw new HttpException(
        'Failed to generate user token ',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  async refresh(token: string) {
    try {
      const decoded = await this.jwtService.verify(token, {
        secret: process.env.REFRESH_TOKEN_SECRET,
      });

      const { exp, iat, ...payload } = decoded;

      const newToken = this.jwtService.sign(payload, {
        secret: process.env.ACCESS_TOKEN_SECRET,
      });

      return newToken;
    } catch (error) {
      throw new HttpException('Failed to refresh', HttpStatus.UNAUTHORIZED);
    }
  }

  async verify(token: string) {
    try {
      const { email }: { email: string } = await this.jwtService.verify(token, {
        secret: process.env.VERIFICATION_EMAIL_SECRET,
      });

      return email;
    } catch (error) {
      throw new HttpException('Invalid token : ', HttpStatus.UNAUTHORIZED);
    }
  }

  async forgotPassword(email: string) {
    return this.jwtService.sign(
      { email },
      {
        secret: process.env.VERIFICATION_RESET_PASSWORD_SECRET,
        privateKey: process.env.VERIFICATION_RESET_PASSWORD_SECRET,
        expiresIn: '5m',
      },
    );
  }

  async verifyResetPassword(token: string) {
    try {
      const { email }: { email: string } = await this.jwtService.verify(token, {
        secret: process.env.VERIFICATION_RESET_PASSWORD_SECRET,
      });

      return email;
    } catch (error) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
  }

  async verification(email: string) {
    return this.jwtService.sign(
      { email },
      {
        secret: process.env.VERIFICATION_EMAIL_SECRET,
        privateKey: process.env.VERIFICATION_EMAIL_SECRET,
        expiresIn: '5m',
      },
    );
  }
}
