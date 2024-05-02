import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  Res,
  Response,
} from '@nestjs/common';
import {
  Request as RequestExpress,
  Response as ResponseExpress,
} from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  async create(@Body() loginDto: LoginDto, @Response() res: ResponseExpress) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = await this.authService.login(user);

    res.cookie('jwt', token.refresh_token, {
      httpOnly: true, //accessible only by web server
      secure: true, //https
      sameSite: 'none', //cross-site cookie
      maxAge: 7 * 24 * 60 * 60 * 1000, //cookie expiry: set to match rT
    });

    return res.json({
      message: 'Authenticated',
      access_token: token.access_token,
    });
  }

  @Get('/refresh-token')
  async refresh(
    @Request() req: RequestExpress,
    @Response() res: ResponseExpress,
  ) {
    const cookies = req.cookies;

    if (!cookies?.jwt) return res.status(401).json({ message: 'Unauthorized' });

    const refreshToken = cookies.jwt;

    const newToken = await this.authService.refresh(refreshToken);
    return res.status(200).json({ message: 'Success', access_token: newToken });
  }

  @Post('/logout')
  clearCookie(@Request() req: RequestExpress, @Res() res: ResponseExpress) {
    const cookies = req.cookies;
    if (!cookies?.jwt) {
      return res.sendStatus(204); // No content
    }
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'none', secure: true });
    return res.json({ message: 'Cookie cleared' });
  }
}
