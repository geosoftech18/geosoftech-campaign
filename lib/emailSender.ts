import nodemailer from 'nodemailer'
import { prisma } from './prisma'
import { GmailAPIProvider, GmailSMTPProvider } from './gmailProvider'

export interface SMTPConfig {
  host: string
  port: number
  secure: boolean
  user: string
  password: string
  fromEmail: string
  fromName?: string
  provider?: 'smtp' | 'gmail-smtp' | 'gmail-api' // Email provider type
  // Gmail API OAuth2 fields (optional)
  clientId?: string
  clientSecret?: string
  refreshToken?: string
}

/**
 * Creates a nodemailer transporter from SMTP config
 * Supports both regular SMTP and Gmail SMTP
 */
export function createTransporter(config: SMTPConfig) {
  // Use Gmail service if provider is gmail-smtp
  if (config.provider === 'gmail-smtp') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.user,
        pass: config.password, // App Password for Gmail
      },
    })
  }

  // Regular SMTP
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.password,
    },
  })
}

/**
 * Replaces template variables in email content
 */
export function replaceTemplateVariables(
  content: string,
  variables: Record<string, string | undefined>
): string {
  let result = content
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
    result = result.replace(regex, value || '')
  })
  return result
}

/**
 * Generates tracking pixel URL
 */
export function getTrackingPixelUrl(leadId: string, baseUrl: string): string {
  return `${baseUrl}/api/track/open?leadId=${leadId}`
}

/**
 * Generates tracked click URL
 */
export function getTrackedClickUrl(
  leadId: string,
  targetUrl: string,
  baseUrl: string
): string {
  const encodedUrl = encodeURIComponent(targetUrl)
  return `${baseUrl}/api/track/click?leadId=${leadId}&url=${encodedUrl}`
}

/**
 * Injects tracking into email HTML
 */
export function injectTracking(
  htmlBody: string,
  leadId: string,
  baseUrl: string
): string {
  // Inject tracking pixel
  const trackingPixel = `<img src="${getTrackingPixelUrl(leadId, baseUrl)}" width="1" height="1" style="display:none;" />`
  
  // Inject click tracking for all links
  const linkRegex = /<a\s+([^>]*href=["']([^"']+)["'][^>]*)>/gi
  let trackedHtml = htmlBody.replace(linkRegex, (match, attrs, url) => {
    // Skip if already a tracking URL
    if (url.includes('/api/track/click')) {
      return match
    }
    const trackedUrl = getTrackedClickUrl(leadId, url, baseUrl)
    return `<a ${attrs.replace(url, trackedUrl)}>`
  })

  // Append tracking pixel before closing body tag, or at the end if no body tag
  if (trackedHtml.includes('</body>')) {
    trackedHtml = trackedHtml.replace('</body>', `${trackingPixel}</body>`)
  } else {
    trackedHtml += trackingPixel
  }

  return trackedHtml
}

/**
 * Sends email to a single lead
 * Supports SMTP, Gmail SMTP, and Gmail API
 */
export async function sendEmailToLead(
  config: SMTPConfig,
  lead: {
    id: string
    email: string
    businessName: string
    city?: string | null
    state?: string | null
    category?: string | null
  },
  campaign: {
    id: string
    subject: string
    body: string
  },
  baseUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Replace template variables
    const subject = replaceTemplateVariables(campaign.subject, {
      BusinessName: lead.businessName,
      City: lead.city || '',
      State: lead.state || '',
      Category: lead.category || '',
    })

    let body = replaceTemplateVariables(campaign.body, {
      BusinessName: lead.businessName,
      City: lead.city || '',
      State: lead.state || '',
      Category: lead.category || '',
    })

    // Inject tracking
    body = injectTracking(body, lead.id, baseUrl)

    // Use Gmail API if configured
    if (config.provider === 'gmail-api' && config.clientId && config.clientSecret && config.refreshToken) {
      const gmailProvider = new GmailAPIProvider({
        user: config.user,
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        refreshToken: config.refreshToken,
        fromEmail: config.fromEmail,
        fromName: config.fromName,
      })

      const result = await gmailProvider.sendEmail({
        to: lead.email,
        subject,
        html: body,
      })

      return result
    }

    // Use Gmail SMTP (App Password) if configured
    if (config.provider === 'gmail-smtp') {
      const gmailSMTP = new GmailSMTPProvider({
        user: config.user,
        appPassword: config.password,
        fromEmail: config.fromEmail,
        fromName: config.fromName,
      })

      const result = await gmailSMTP.sendEmail({
        to: lead.email,
        subject,
        html: body,
      })

      return result
    }

    // Use regular SMTP
    const transporter = createTransporter(config)

    await transporter.sendMail({
      from: config.fromName
        ? `"${config.fromName}" <${config.fromEmail}>`
        : config.fromEmail,
      to: lead.email,
      subject,
      html: body,
    })

    return { success: true }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Unknown error occurred',
    }
  }
}

/**
 * Gets SMTP config from database or environment
 */
export async function getSMTPConfig(): Promise<SMTPConfig> {
  // Try to get from database first
  const dbSettings = await prisma.sMTPSettings.findFirst()

  if (dbSettings) {
    return {
      host: dbSettings.host,
      port: dbSettings.port,
      secure: dbSettings.secure,
      user: dbSettings.smtpUser,
      password: dbSettings.smtpPassword,
      fromEmail: dbSettings.fromEmail,
      fromName: dbSettings.fromName || undefined,
      provider: ((dbSettings as any).provider as 'smtp' | 'gmail-smtp' | 'gmail-api') || 'smtp',
      clientId: (dbSettings as any).clientId || undefined,
      clientSecret: (dbSettings as any).clientSecret || undefined,
      refreshToken: (dbSettings as any).refreshToken || undefined,
    }
  }

  // Fallback to environment variables
  return {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASS || '',
    fromEmail: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || '',
    fromName: process.env.SMTP_FROM_NAME || undefined,
  }
}

