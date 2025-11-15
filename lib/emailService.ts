/**
 * Email Service Abstraction Layer
 * Supports multiple email providers (SMTP, SendGrid, Resend, etc.)
 */

import nodemailer from 'nodemailer'
import { SMTPConfig } from './emailSender'

export interface EmailProvider {
  sendEmail(params: {
    to: string
    subject: string
    html: string
    fromEmail: string
    fromName?: string
  }): Promise<{ success: boolean; error?: string; messageId?: string }>
}

/**
 * SMTP Provider (Current implementation)
 */
export class SMTPProvider implements EmailProvider {
  private transporter: nodemailer.Transporter

  constructor(config: SMTPConfig) {
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.password,
      },
    })
  }

  async sendEmail(params: {
    to: string
    subject: string
    html: string
    fromEmail: string
    fromName?: string
  }): Promise<{ success: boolean; error?: string; messageId?: string }> {
    try {
      const result = await this.transporter.sendMail({
        from: params.fromName
          ? `"${params.fromName}" <${params.fromEmail}>`
          : params.fromEmail,
        to: params.to,
        subject: params.subject,
        html: params.html,
      })

      return {
        success: true,
        messageId: result.messageId,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Unknown error occurred',
      }
    }
  }
}

/**
 * SendGrid Provider (Recommended alternative)
 * Install: npm install @sendgrid/mail
 */
export class SendGridProvider implements EmailProvider {
  private apiKey: string
  private sendgrid: any

  constructor(apiKey: string) {
    this.apiKey = apiKey
    // Dynamic import to avoid requiring SendGrid if not used
    // In production, import at top: import sgMail from '@sendgrid/mail'
  }

  async sendEmail(params: {
    to: string
    subject: string
    html: string
    fromEmail: string
    fromName?: string
  }): Promise<{ success: boolean; error?: string; messageId?: string }> {
    try {
      // Dynamic import
      const sgMail = await import('@sendgrid/mail')
      sgMail.default.setApiKey(this.apiKey)

      const msg = {
        to: params.to,
        from: params.fromName
          ? { email: params.fromEmail, name: params.fromName }
          : params.fromEmail,
        subject: params.subject,
        html: params.html,
        // Enable click tracking (can be customized)
        trackingSettings: {
          clickTracking: {
            enable: true,
            enableText: true,
          },
          openTracking: {
            enable: true,
          },
        },
      }

      const [response] = await sgMail.default.send(msg)

      return {
        success: true,
        messageId: response.headers['x-message-id'] || undefined,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Unknown error occurred',
      }
    }
  }
}

/**
 * Resend Provider (Modern alternative)
 * Install: npm install resend
 */
export class ResendProvider implements EmailProvider {
  private apiKey: string
  private resend: any

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async sendEmail(params: {
    to: string
    subject: string
    html: string
    fromEmail: string
    fromName?: string
  }): Promise<{ success: boolean; error?: string; messageId?: string }> {
    try {
      // Dynamic import
      const { Resend } = await import('resend')
      const resend = new Resend(this.apiKey)

      const { data, error } = await resend.emails.send({
        from: params.fromName
          ? `${params.fromName} <${params.fromEmail}>`
          : params.fromEmail,
        to: params.to,
        subject: params.subject,
        html: params.html,
      })

      if (error) {
        return {
          success: false,
          error: error.message || 'Unknown error occurred',
        }
      }

      return {
        success: true,
        messageId: data?.id,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Unknown error occurred',
      }
    }
  }
}

/**
 * Factory function to create email provider based on configuration
 */
export function createEmailProvider(
  type: 'smtp' | 'sendgrid' | 'resend',
  config: SMTPConfig | { apiKey: string }
): EmailProvider {
  switch (type) {
    case 'smtp':
      return new SMTPProvider(config as SMTPConfig)
    case 'sendgrid':
      return new SendGridProvider((config as { apiKey: string }).apiKey)
    case 'resend':
      return new ResendProvider((config as { apiKey: string }).apiKey)
    default:
      throw new Error(`Unsupported email provider: ${type}`)
  }
}

