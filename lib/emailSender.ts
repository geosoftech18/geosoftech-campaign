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
      // Use IPv4 only to avoid IPv6 resolution warnings
      connectionTimeout: 10000,
      socketTimeout: 10000,
      dns: {
        lookup: (hostname: string, options: any, callback: any) => {
          // Force IPv4 lookup to avoid "Failed to resolve IPv6" warnings
          const dns = require('dns')
          dns.lookup(hostname, { family: 4 }, callback)
        },
      },
    } as any)
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
    // Use IPv4 only to avoid IPv6 resolution warnings
    connectionTimeout: 10000,
    socketTimeout: 10000,
    dns: {
      lookup: (hostname: string, options: any, callback: any) => {
        // Force IPv4 lookup to avoid "Failed to resolve IPv6" warnings
        const dns = require('dns')
        dns.lookup(hostname, { family: 4 }, callback)
      },
    },
  } as any)
}

/**
 * Replaces template variables in email content
 * Supports: {{BusinessName}}, {{City}}, {{State}}, {{Category}}
 */
export function replaceTemplateVariables(
  content: string,
  variables: Record<string, string | undefined>
): string {
  if (!content) return content
  
  let result = content
  Object.entries(variables).forEach(([key, value]) => {
    // Match {{VariableName}} with case-insensitive matching
    // Also handle variations like {{BusinessName}}, {{businessName}}, etc.
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'gi')
    const replacement = value || ''
    result = result.replace(regex, replacement)
  })
  
  // Also handle common typos and variations
  if (variables.BusinessName) {
    result = result.replace(/\{\{BussinessName\}\}/gi, variables.BusinessName)
    result = result.replace(/\{\{businessName\}\}/gi, variables.BusinessName)
    result = result.replace(/\{\{Businessname\}\}/gi, variables.BusinessName)
  }
  
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
 * Validates email address format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
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
    // Validate email address before attempting to send
    if (!isValidEmail(lead.email)) {
      return {
        success: false,
        error: `Invalid email address format: ${lead.email}`,
      }
    }
    // Replace template variables
    // Ensure businessName exists, fallback to empty string if not
    const businessName = lead.businessName || 'Valued Customer'
    
    const subject = replaceTemplateVariables(campaign.subject || '', {
      BusinessName: businessName,
      City: lead.city || '',
      State: lead.state || '',
      Category: lead.category || '',
    })

    let body = replaceTemplateVariables(campaign.body || '', {
      BusinessName: businessName,
      City: lead.city || '',
      State: lead.state || '',
      Category: lead.category || '',
    })
    
    // Debug logging (remove in production if needed)
    if (campaign.subject?.includes('{{')) {
      console.log(`Template replacement - Original: "${campaign.subject}", Replaced: "${subject}"`)
      console.log(`BusinessName value: "${businessName}"`)
    }

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

