import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware<Request, Response> {
  constructor(private readonly jwtService: JwtService) {}
  async use(req: Request, res: Response, next: () => void) {
    const authorization = req.headers.authorization;
    const token = authorization?.split(' ')[1];

    if (token) {
      try {
        await this.jwtService.verify(token, {
          secret: process.env.ACCESS_TOKEN_SECRET,
        });
        next();
      } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
        // throw new HttpException('Invalid token.', HttpStatus.UNAUTHORIZED);
      }
    } else {
      res.status(401).json({ message: 'Token not found.' });
      // throw new HttpException('Token not found.', HttpStatus.UNAUTHORIZED);
    }
  }
}
