import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
    private transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: 'localhost',
            port: 587,
            secure: false,
            auth: {
                user: 'superadmin@currencyservice.com',
                pass: 'password',
            },
        });
    }

    async sendMail(to: string, subject: string, text: string, attachments: any[]) {
        const mailOptions = {
            from: 'superadmin@currencyservice.com',
            to,
            subject,
            text,
            attachments,
        };
        return await this.transporter.sendMail(mailOptions);
    }
}
