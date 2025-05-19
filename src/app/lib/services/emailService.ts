
"use server";
import nodemailer from 'nodemailer';

/**
 * Interface for email sending options
 */
export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

/**
 * Interface for email sending result
 */
export interface EmailResult {
  success: boolean;
  error?: string;
}

/**
 * Sends an email using nodemailer
 * 
 * @param options The email options
 * @returns The result of the email sending operation
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  try {
    // Get email configuration from environment variables
    const host = process.env.EMAIL_HOST;
    const port = parseInt(process.env.EMAIL_PORT || '587');
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;
    const from = process.env.EMAIL_FROM || user;

    if (!host || !user || !pass) {
      throw new Error('Email configuration is incomplete');
    }

    // Create a transporter

    var transporter = nodemailer.createTransport({
      host,
      port: 465,
      secure: true, // use SSL
      auth: {
          user: user,
          pass: pass
      }
  });

    // Send the email
    await transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}