import { HttpException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenService {
  constructor(private jwtService: JwtService) {}

  async verify(token: string) {
    try {
      const { email }: { email: string } = await this.jwtService.verify(token, {
        secret: process.env.VERIFICATION_EMAIL_SECRET,
      });

      return email;
    } catch (error) {
      throw new HttpException('Invalid token : ', 401);
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
