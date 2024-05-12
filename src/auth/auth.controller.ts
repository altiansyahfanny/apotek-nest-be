import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Post,
  Query,
  Request,
  Res,
  Response,
} from '@nestjs/common';
import {
  Request as RequestExpress,
  Response as ResponseExpress,
} from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { WebResponse } from 'src/model/web.model';
import { Logger } from 'winston';
import {
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
} from '../model/auth.model';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
  ) {}

  @Post('/login')
  async login(
    @Body() loginRequest: LoginRequest,
    @Response() res: ResponseExpress,
  ) {
    const token = await this.authService.login(loginRequest);

    res.cookie('jwt', token.refresh_token, {
      httpOnly: true, //accessible only by web server
      secure: true, //https
      sameSite: 'none', //cross-site cookie
      maxAge: 7 * 24 * 60 * 60 * 1000, //cookie expiry: set to match rT
    });

    return res.status(200).json({
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

    if (!cookies?.jwt) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const refreshToken = cookies.jwt;
    const newToken = await this.authService.refresh(refreshToken);

    return res.status(200).json({ message: 'Success', access_token: newToken });
    // return { message: 'Success', access_token: newToken };
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

  @Post('/register')
  async register(
    @Body() request: RegisterRequest,
  ): Promise<WebResponse<RegisterResponse>> {
    const result = await this.authService.register(request);
    return {
      data: result,
    };
  }

  @Get('/verification')
  async verification(@Query('token') token: string) {
    return this.authService.verificationEmail(token);
  }

  @Post('/forgot-password')
  async forgotPassword(@Body() request: ForgotPasswordRequest) {
    return this.authService.forgotPassword(request);
  }

  @Post('/reset-password')
  async verifyForgotPassword(@Body() request: ResetPasswordRequest) {
    return this.authService.resetPassword(request);
  }
}
