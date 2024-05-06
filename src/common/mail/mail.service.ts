import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { TokenService } from 'src/common/token/token.service';

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
}
