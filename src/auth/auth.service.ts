import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from 'src/database/database.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private databaseService: DatabaseService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.databaseService.user.findFirst({
      where: { email },
    });

    if (user) return user;
    return null;
  }

  async login(user: Prisma.UserCreateManyInput) {
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
        // secret: '4321',
        // privateKey: '8765',
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
      throw new Error('Invalid refresh token');
    }
  }
}
