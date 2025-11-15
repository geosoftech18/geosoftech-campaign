/**
 * Google Workspace / Gmail API Provider
 * Uses Gmail API for better rate limits and reliability
 */

import nodemailer from 'nodemailer'

export interface GmailConfig {
  user: string // Gmail/Google Workspace email
  clientId: string // OAuth2 Client ID
  clientSecret: string // OAuth2 Client Secret
  refreshToken: string // OAuth2 Refresh Token
  fromEmail: string
  fromName?: string
}

/**
 * Gmail API Provider using OAuth2
 * More reliable than SMTP with better rate limits
 */
export class GmailAPIProvider {
  private config: GmailConfig
  private transporter: nodemailer.Transporter | null = null

  constructor(config: GmailConfig) {
    this.config = config
  }

  /**
   * Creates OAuth2 transporter for Gmail
   */
  private async createTransporter(): Promise<nodemailer.Transporter> {
    if (this.transporter) {
      return this.transporter
    }

    const { google } = await import('googleapis')
    const OAuth2 = google.auth.OAuth2

    const oauth2Client = new OAuth2(
      this.config.clientId,
      this.config.clientSecret,
      'https://developers.google.com/oauthplayground' // Redirect URI
    )

    oauth2Client.setCredentials({
      refresh_token: this.config.refreshToken,
    })

    // Get access token
    const accessToken = await oauth2Client.getAccessToken()

    if (!accessToken.token) {
      throw new Error('Failed to get access token from Google OAuth2')
    }

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: this.config.user,
        clientId: this.config.clientId,
        clientSecret: this.config.clientSecret,
        refreshToken: this.config.refreshToken,
        accessToken: accessToken.token,
      },
    } as any)

    return this.transporter
  }

  /**
   * Sends email via Gmail API
   */
  async sendEmail(params: {
    to: string
    subject: string
    html: string
  }): Promise<{ success: boolean; error?: string; messageId?: string }> {
    try {
      const transporter = await this.createTransporter()

      const result = await transporter.sendMail({
        from: this.config.fromName
          ? `"${this.config.fromName}" <${this.config.fromEmail}>`
          : this.config.fromEmail,
        to: params.to,
        subject: params.subject,
        html: params.html,
      })

      return {
        success: true,
        messageId: result.messageId,
      }
    } catch (error: any) {
      // Handle Gmail-specific errors
      let errorMessage = error.message || 'Unknown error occurred'

      if (error.code === 'EAUTH') {
        errorMessage = 'Gmail authentication failed. Please check your OAuth2 credentials.'
      } else if (error.code === 'EENVELOPE') {
        errorMessage = 'Invalid email address or recipient.'
      } else if (error.responseCode === 550) {
        errorMessage = 'Gmail rate limit exceeded. Please wait before sending more emails.'
      }

      return {
        success: false,
        error: errorMessage,
      }
    }
  }
}

/**
 * Simplified Gmail SMTP Provider (using App Password)
 * Easier setup but less secure than OAuth2
 */
export class GmailSMTPProvider {
  private config: {
    user: string
    appPassword: string // Gmail App Password
    fromEmail: string
    fromName?: string
  }

  constructor(config: {
    user: string
    appPassword: string
    fromEmail: string
    fromName?: string
  }) {
    this.config = config
  }

  async sendEmail(params: {
    to: string
    subject: string
    html: string
  }): Promise<{ success: boolean; error?: string; messageId?: string }> {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: this.config.user,
          pass: this.config.appPassword, // Use App Password, not regular password
        },
      })

      const result = await transporter.sendMail({
        from: this.config.fromName
          ? `"${this.config.fromName}" <${this.config.fromEmail}>`
          : this.config.fromEmail,
        to: params.to,
        subject: params.subject,
        html: params.html,
      })

      return {
        success: true,
        messageId: result.messageId,
      }
    } catch (error: any) {
      let errorMessage = error.message || 'Unknown error occurred'

      if (error.code === 'EAUTH') {
        errorMessage = 'Gmail authentication failed. Please check your App Password.'
      } else if (error.code === 'EENVELOPE') {
        errorMessage = 'Invalid email address or recipient.'
      }

      return {
        success: false,
        error: errorMessage,
      }
    }
  }
}

