import { MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

export const mailerConfig: MailerOptions = {
  transport: {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'mitaniafarsali@gmail.com',
      pass: 'qhlt nrac tgck csrb',
    },
  },
  defaults: {
    from: '"No Reply" <no-reply@localhost>',
  },
  // preview: true,
  template: {
    dir: process.cwd() + '/template/',
    adapter: new HandlebarsAdapter(),
    options: {
      strict: true,
    },
  },
};
