import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      port: 1025,
    });
  }

  async sendMail(
    to: string,
    subject: string,
    text: string,
    attachments: any[],
  ) {
    const mailOptions = {
      from: 'mailer@currencyservice.com',
      to,
      subject,
      text,
      attachments,
    };
    return await this.transporter.sendMail(mailOptions);
  }
}
