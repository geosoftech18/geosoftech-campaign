import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSMTPConfig, sendEmailToLead } from '@/lib/emailSender'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { testEmail } = await request.json()

    if (!testEmail || !testEmail.includes('@')) {
      return NextResponse.json(
        { error: 'Valid test email address is required' },
        { status: 400 }
      )
    }

    // Get campaign
    const campaign = await prisma.campaign.findUnique({
      where: { id },
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Get SMTP config
    const smtpConfig = await getSMTPConfig()

    // Get base URL for tracking - use request origin or fallback to env vars
    const baseUrl = 
      request.nextUrl.origin || 
      process.env.NEXTAUTH_URL || 
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'http://localhost:3000'
    
    console.log('Sending test email to:', testEmail)
    console.log('Using baseUrl for tracking:', baseUrl)

    // Create a mock lead for testing
    const testLead = {
      id: 'test-lead-' + Date.now(), // Temporary ID for tracking
      email: testEmail,
      businessName: 'Test Business',
      city: 'Test City',
      state: 'Test State',
      category: 'Test Category',
    }

    // Send test email
    const result = await sendEmailToLead(
      smtpConfig,
      testLead,
      {
        id: campaign.id,
        subject: campaign.subject,
        body: campaign.body,
      },
      baseUrl
    )

    if (result.success) {
      // Create email log entry for tracking (optional, for analytics)
      try {
        await prisma.emailLog.create({
          data: {
            leadId: testLead.id,
            campaignId: id,
            status: 'sent',
            sentAt: new Date(),
          },
        }).catch(() => {
          // Ignore if lead doesn't exist (it's a test lead)
          console.log('Test email log not created (expected for test emails)')
        })
      } catch (logError) {
        // Ignore log errors for test emails
        console.log('Test email log error (ignored):', logError)
      }

      return NextResponse.json({
        message: 'Test email sent successfully',
        testEmail,
        campaignName: campaign.name,
      })
    } else {
      return NextResponse.json(
        {
        error: result.error || 'Failed to send test email',
        testEmail,
      },
      { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Error sending test email:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send test email' },
      { status: 500 }
    )
  }
}

