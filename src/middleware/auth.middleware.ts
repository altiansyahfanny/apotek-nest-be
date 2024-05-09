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
        const result = await this.jwtService.verify(token, {
          secret: process.env.ACCESS_TOKEN_SECRET,
        });
        req.headers['user'] = result.user;
        next();
      } catch (error) {
        // Invalid token
        res.status(401).json({ message: 'Unauthorized' });
      }
    } else {
      // Token not found
      res.status(401).json({ message: 'Unauthorized' });
    }
  }
}
