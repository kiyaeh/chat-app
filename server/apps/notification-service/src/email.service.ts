import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  async sendEmail(to: string, subject: string, content: string) {
    // Mock email service - replace with actual email provider (SendGrid, AWS SES, etc.)
    console.log(`📧 Email sent to ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Content: ${content}`);
    
    // Simulate email sending
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          messageId: `email-${Date.now()}`,
          to,
          subject,
        });
      }, 100);
    });
  }

  async sendWelcomeEmail(to: string, username: string) {
    return this.sendEmail(
      to,
      'Welcome to Chat App!',
      `Hello ${username}, welcome to our chat application!`
    );
  }

  async sendPasswordResetEmail(to: string, resetToken: string) {
    return this.sendEmail(
      to,
      'Password Reset Request',
      `Click here to reset your password: /reset-password?token=${resetToken}`
    );
  }
}