import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSMTPConfig, sendEmailToLead } from '@/lib/emailSender'

export async function GET(request: NextRequest) {
  // Simple auth check - in production, use a secret token
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Follow-up emails are sent separately and don't count towards daily campaign limit
    // Find all pending follow-ups that are due
    const now = new Date()
    const dueFollowUps = await prisma.followUp.findMany({
      where: {
        status: 'pending',
        scheduledFor: { lte: now },
      },
      include: {
        campaign: true,
        lead: true,
      },
    })

    let sent = 0
    let failed = 0

    for (const followUp of dueFollowUps) {
      try {
        // Get SMTP config (use default for now, could be per-user)
        const smtpConfig = await getSMTPConfig()
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

        // Determine which follow-up email to send
        let subject = ''
        let body = ''

        if (followUp.type === 'followup1') {
          subject = followUp.campaign.followUp1Subject || ''
          body = followUp.campaign.followUp1Body || ''
        } else if (followUp.type === 'followup2') {
          subject = followUp.campaign.followUp2Subject || ''
          body = followUp.campaign.followUp2Body || ''
        } else if (followUp.type === 'followup3') {
          subject = followUp.campaign.followUp3Subject || ''
          body = followUp.campaign.followUp3Body || ''
        } else if (followUp.type === 'followup4') {
          subject = followUp.campaign.followUp4Subject || ''
          body = followUp.campaign.followUp4Body || ''
        }

        if (!subject || !body) {
          await prisma.followUp.update({
            where: { id: followUp.id },
            data: {
              status: 'failed',
              errorMessage: 'Follow-up email not configured',
            },
          })
          failed++
          continue
        }

        // Send follow-up email
        const result = await sendEmailToLead(
          smtpConfig,
          followUp.lead,
          {
            id: followUp.campaign.id,
            subject,
            body,
          },
          baseUrl
        )

        if (result.success) {
          await prisma.followUp.update({
            where: { id: followUp.id },
            data: {
              status: 'sent',
              sentAt: new Date(),
            },
          })

          // Create email log entry
          await prisma.emailLog.create({
            data: {
              leadId: followUp.leadId,
              campaignId: followUp.campaignId,
              status: 'sent',
              sentAt: new Date(),
            },
          })

          sent++
        } else {
          await prisma.followUp.update({
            where: { id: followUp.id },
            data: {
              status: 'failed',
              errorMessage: result.error || 'Unknown error',
            },
          })
          failed++
        }
      } catch (error: any) {
        await prisma.followUp.update({
          where: { id: followUp.id },
          data: {
            status: 'failed',
            errorMessage: error.message || 'Unknown error',
          },
        })
        failed++
      }
    }

    return NextResponse.json({
      message: 'Follow-up emails processed',
      sent,
      failed,
      total: dueFollowUps.length,
    })
  } catch (error: any) {
    console.error('Error processing follow-ups:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process follow-ups' },
      { status: 500 }
    )
  }
}


