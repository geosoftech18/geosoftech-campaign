import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSMTPConfig, sendEmailToLead } from '@/lib/emailSender'
import { buildSegmentFilter } from '@/lib/segmenter'

const BATCH_SIZE = 100
const DAILY_EMAIL_LIMIT = 700 // Maximum emails per day

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const campaign = await prisma.campaign.findUnique({
      where: { id },
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    if (campaign.status === 'sending') {
      return NextResponse.json(
        { error: 'Campaign is already being sent' },
        { status: 400 }
      )
    }

    // Check daily email limit
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Count emails sent today
    const emailsSentToday = await prisma.emailLog.count({
      where: {
        status: 'sent',
        sentAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    })

    const remainingQuota = DAILY_EMAIL_LIMIT - emailsSentToday

    if (remainingQuota <= 0) {
      return NextResponse.json(
        {
          error: `Daily email limit reached. You've sent ${emailsSentToday} emails today. Maximum is ${DAILY_EMAIL_LIMIT} per day. Please try again tomorrow.`,
          emailsSentToday,
          dailyLimit: DAILY_EMAIL_LIMIT,
        },
        { status: 429 }
      )
    }

    // Get SMTP config
    const smtpConfig = await getSMTPConfig()

    // Build segment filter
    const segmentFilter = buildSegmentFilter(
      campaign.segmentCity,
      campaign.segmentState,
      campaign.segmentCategory
    )

    // Get leads matching segment
    const allMatchingLeads = await prisma.lead.findMany({
      where: segmentFilter,
    })

    // Get leads that already received an email today (to ensure unique emails per day)
    const leadsSentToday = await prisma.emailLog.findMany({
      where: {
        status: 'sent',
        sentAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      select: {
        leadId: true,
      },
      distinct: ['leadId'],
    })

    const sentLeadIds = new Set(leadsSentToday.map((log) => log.leadId))

    // Filter out leads that already received an email today
    const availableLeads = allMatchingLeads.filter((lead) => !sentLeadIds.has(lead.id))

    // Limit to remaining quota
    const leads = availableLeads.slice(0, remainingQuota)

    if (leads.length === 0) {
      return NextResponse.json(
        {
          error: 'No available leads to send to. All matching leads have already received an email today.',
          emailsSentToday,
          dailyLimit: DAILY_EMAIL_LIMIT,
          matchingLeads: allMatchingLeads.length,
          alreadySentToday: sentLeadIds.size,
        },
        { status: 400 }
      )
    }

    // Update campaign status
    await prisma.campaign.update({
      where: { id },
      data: { status: 'sending' },
    })

    // Get base URL for tracking
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

    // Process in batches
    let sent = 0
    let failed = 0

    for (let i = 0; i < leads.length; i += BATCH_SIZE) {
      const batch = leads.slice(i, i + BATCH_SIZE)

      await Promise.all(
        batch.map(async (lead) => {
            // Create email log entry
            const emailLog = await prisma.emailLog.create({
              data: {
                leadId: lead.id,
                campaignId: id,
                status: 'pending',
              },
            })

          try {
            // Send email
            const result = await sendEmailToLead(
              smtpConfig,
              lead,
              campaign,
              baseUrl
            )

            if (result.success) {
              await prisma.emailLog.update({
                where: { id: emailLog.id },
                data: {
                  status: 'sent',
                  sentAt: new Date(),
                },
              })

              // Schedule follow-ups if configured
              if (campaign.followUp1Days && campaign.followUp1Subject && campaign.followUp1Body) {
                await prisma.followUp.create({
                  data: {
                    campaignId: id,
                    leadId: lead.id,
                    emailLogId: emailLog.id,
                    type: 'followup1',
                    scheduledFor: new Date(
                      Date.now() + campaign.followUp1Days * 24 * 60 * 60 * 1000
                    ),
                  },
                })
              }

              if (campaign.followUp2Days && campaign.followUp2Subject && campaign.followUp2Body) {
                await prisma.followUp.create({
                  data: {
                    campaignId: id,
                    leadId: lead.id,
                    emailLogId: emailLog.id,
                    type: 'followup2',
                    scheduledFor: new Date(
                      Date.now() + campaign.followUp2Days * 24 * 60 * 60 * 1000
                    ),
                  },
                })
              }

              sent++
            } else {
              await prisma.emailLog.update({
                where: { id: emailLog.id },
                data: {
                  status: 'failed',
                  errorMessage: result.error || 'Unknown error',
                },
              })
              failed++
            }
          } catch (error: any) {
            await prisma.emailLog.update({
              where: { id: emailLog.id },
              data: {
                status: 'failed',
                errorMessage: error.message || 'Unknown error',
              },
            })
            failed++
          }
        })
      )

      // Small delay between batches to protect domain health
      if (i + BATCH_SIZE < leads.length) {
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
    }

    // Update campaign status
    const finalStatus = sent > 0 ? 'completed' : 'draft'
    await prisma.campaign.update({
      where: { id },
      data: { status: finalStatus },
    })

    // Calculate remaining quota for the day
    const finalEmailsSentToday = emailsSentToday + sent
    const remainingQuotaAfter = DAILY_EMAIL_LIMIT - finalEmailsSentToday

    return NextResponse.json({
      message: `Campaign sent successfully`,
      sent,
      failed,
      total: leads.length,
      dailyStats: {
        emailsSentToday: finalEmailsSentToday,
        dailyLimit: DAILY_EMAIL_LIMIT,
        remainingQuota: remainingQuotaAfter,
      },
      note: allMatchingLeads.length > leads.length
        ? `${allMatchingLeads.length - leads.length} leads were skipped (already received email today or quota limit reached)`
        : undefined,
    })
  } catch (error: any) {
    console.error('Error sending campaign:', error)

    // Update campaign status on error
    await prisma.campaign.update({
      where: { id },
      data: { status: 'draft' },
    }).catch(() => {})

    return NextResponse.json(
      { error: error.message || 'Failed to send campaign' },
      { status: 500 }
    )
  }
}

