import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get the first (and only) SMTP settings
    const settings = await prisma.sMTPSettings.findFirst()

    return NextResponse.json({ settings })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch SMTP settings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      host,
      port,
      secure,
      user,
      password,
      fromEmail,
      fromName,
      provider,
      clientId,
      clientSecret,
      refreshToken,
    } = body

    // Validation based on provider
    if (provider === 'gmail-api') {
      if (!user || !clientId || !clientSecret || !refreshToken || !fromEmail) {
        return NextResponse.json(
          { error: 'Missing required fields for Gmail API. Need: user, clientId, clientSecret, refreshToken, fromEmail' },
          { status: 400 }
        )
      }
    } else if (provider === 'gmail-smtp') {
      if (!user || !password || !fromEmail) {
        return NextResponse.json(
          { error: 'Missing required fields for Gmail SMTP. Need: user, password (App Password), fromEmail' },
          { status: 400 }
        )
      }
    } else {
      // Regular SMTP
      if (!host || !port || !user || !password || !fromEmail) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        )
      }
    }

    // Get existing settings or create new
    const existing = await prisma.sMTPSettings.findFirst()
    
    const settings = existing
      ? await prisma.sMTPSettings.update({
          where: { id: existing.id },
          data: {
            host: host || 'smtp.gmail.com',
            port: port || 587,
            secure: secure || false,
            smtpUser: user,
            smtpPassword: password || '',
            fromEmail,
            fromName: fromName || null,
            provider: provider || 'smtp',
            clientId: clientId || null,
            clientSecret: clientSecret || null,
            refreshToken: refreshToken || null,
          },
        })
      : await prisma.sMTPSettings.create({
          data: {
            host: host || 'smtp.gmail.com',
            port: port || 587,
            secure: secure || false,
            smtpUser: user,
            smtpPassword: password || '',
            fromEmail,
            fromName: fromName || null,
            provider: provider || 'smtp',
            clientId: clientId || null,
            clientSecret: clientSecret || null,
            refreshToken: refreshToken || null,
          },
        })

    // Don't return sensitive data
    const { smtpPassword, clientSecret: _, ...safeSettings } = settings
    return NextResponse.json({ settings: safeSettings })
  } catch (error: any) {
    console.error('Error saving SMTP settings:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to save SMTP settings' },
      { status: 500 }
    )
  }
}

