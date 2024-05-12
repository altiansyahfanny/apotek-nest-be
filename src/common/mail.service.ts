import { MailerService } from '@nestjs-modules/mailer';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { TokenService } from 'src/common/token.service';

@Injectable()
export class MailService {
  constructor(
    private readonly mailService: MailerService,
    private readonly tokenService: TokenService,
  ) {}

  async verification(email: string) {
    // return false;
    try {
      const token = await this.tokenService.verification(email);

      await this.mailService.sendMail({
        to: email,
        subject: 'Verification Email',
        html: `follow this link to activated your account. <a href="http://localhost:5173/verification?token=${token}">verify</a>`,
      });

      return true;
    } catch (error) {
      console.error('Error sending emails : ', error);
      return false;
    }
  }

  async forgotPassword(email: string) {
    try {
      const token = await this.tokenService.forgotPassword(email);

      const emailSent = await this.mailService.sendMail({
        to: email,
        subject: 'Reset Password',
        html: `follow this link to reset your password. <a href="http://localhost:5173/reset-password?token=${token}">reset</a>`,
      });

      if (emailSent) {
        return true;
      } else {
        throw new HttpException(
          'Failed to send email',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } catch (error) {
      console.error('Error sending emails : ', error);
      throw new HttpException(
        'Failed to send email',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
