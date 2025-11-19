import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSMTPConfig, sendEmailToLead } from '@/lib/emailSender'
import { buildSegmentFilter } from '@/lib/segmenter'

const BATCH_SIZE = 20
const DAILY_EMAIL_LIMIT = 700
const EMAIL_DELAY_MS = 3000
const BATCH_DELAY_MS = 10000

export async function GET(request: NextRequest) {
  // Simple auth check - in production, use a secret token
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Check daily email limit (campaign emails only)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Count campaign emails sent today
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
      return NextResponse.json({
        message: 'Daily campaign email limit reached. No campaigns will be sent today.',
        emailsSentToday,
        dailyLimit: DAILY_EMAIL_LIMIT,
      })
    }

    // Find all active campaigns that should be sent daily
    const activeCampaigns = await prisma.campaign.findMany({
      where: {
        status: 'active',
      },
    })

    if (activeCampaigns.length === 0) {
      return NextResponse.json({
        message: 'No active campaigns found for daily sending.',
        campaignsProcessed: 0,
      })
    }

    const smtpConfig = await getSMTPConfig()
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const results = []

    for (const campaign of activeCampaigns) {
      try {
        // Skip if currently sending
        if (campaign.status === 'sending') {
          continue
        }

        // Build segment filter (including group if specified)
        const segmentFilter = buildSegmentFilter(
          campaign.segmentCity,
          campaign.segmentState,
          campaign.segmentCategory,
          campaign.segmentGroupId || null
        )

        // Get leads matching segment
        const allMatchingLeads = await prisma.lead.findMany({
          where: segmentFilter,
        })

        // Get leads that already received an email from THIS campaign
        const leadsSentFromThisCampaign = await prisma.emailLog.findMany({
          where: {
            campaignId: campaign.id,
            status: 'sent',
          },
          select: {
            leadId: true,
          },
          distinct: ['leadId'],
        })

        const sentLeadIds = new Set(
          leadsSentFromThisCampaign.map((log) => log.leadId)
        )

        // Filter out leads that already received an email from this campaign
        const availableLeads = allMatchingLeads.filter(
          (lead) => !sentLeadIds.has(lead.id)
        )

        if (availableLeads.length === 0) {
          results.push({
            campaignId: campaign.id,
            campaignName: campaign.name,
            status: 'skipped',
            reason: 'No available leads (all leads already received this campaign)',
          })
          continue
        }

        // Limit to remaining quota
        const leadsToSend = availableLeads.slice(0, remainingQuota)

        if (leadsToSend.length === 0) {
          results.push({
            campaignId: campaign.id,
            campaignName: campaign.name,
            status: 'skipped',
            reason: 'Daily quota limit reached',
          })
          continue
        }

        // Update campaign status to sending
        await prisma.campaign.update({
          where: { id: campaign.id },
          data: { status: 'sending' },
        })

        let sent = 0
        let failed = 0

        // Send emails in batches
        for (let i = 0; i < leadsToSend.length; i += BATCH_SIZE) {
          // Check if campaign was paused
          const currentCampaign = await prisma.campaign.findUnique({
            where: { id: campaign.id },
            select: { status: true },
          })

          if (currentCampaign?.status === 'paused') {
            break
          }

          const batch = leadsToSend.slice(i, i + BATCH_SIZE)

          for (const lead of batch) {
            try {
              // Create email log entry
              const emailLog = await prisma.emailLog.create({
                data: {
                  leadId: lead.id,
                  campaignId: campaign.id,
                  status: 'pending',
                },
              })

              // Add delay between emails
              if (i > 0 || batch.indexOf(lead) > 0) {
                await new Promise((resolve) => setTimeout(resolve, EMAIL_DELAY_MS))
              }

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

                sent++

                // Schedule follow-ups
                if (campaign.followUp1Days && campaign.followUp1Subject && campaign.followUp1Body) {
                  await prisma.followUp.create({
                    data: {
                      campaignId: campaign.id,
                      leadId: lead.id,
                      emailLogId: emailLog.id,
                      type: 'followup1',
                      scheduledFor: new Date(
                        Date.now() + campaign.followUp1Days * 24 * 60 * 60 * 1000
                      ),
                    },
                  }).catch(() => {})
                }

                if (campaign.followUp2Days && campaign.followUp2Subject && campaign.followUp2Body) {
                  await prisma.followUp.create({
                    data: {
                      campaignId: campaign.id,
                      leadId: lead.id,
                      emailLogId: emailLog.id,
                      type: 'followup2',
                      scheduledFor: new Date(
                        Date.now() + campaign.followUp2Days * 24 * 60 * 60 * 1000
                      ),
                    },
                  }).catch(() => {})
                }

                if (campaign.followUp3Days && campaign.followUp3Subject && campaign.followUp3Body) {
                  await prisma.followUp.create({
                    data: {
                      campaignId: campaign.id,
                      leadId: lead.id,
                      emailLogId: emailLog.id,
                      type: 'followup3',
                      scheduledFor: new Date(
                        Date.now() + campaign.followUp3Days * 24 * 60 * 60 * 1000
                      ),
                    },
                  }).catch(() => {})
                }

                if (campaign.followUp4Days && campaign.followUp4Subject && campaign.followUp4Body) {
                  await prisma.followUp.create({
                    data: {
                      campaignId: campaign.id,
                      leadId: lead.id,
                      emailLogId: emailLog.id,
                      type: 'followup4',
                      scheduledFor: new Date(
                        Date.now() + campaign.followUp4Days * 24 * 60 * 60 * 1000
                      ),
                    },
                  }).catch(() => {})
                }
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
              failed++
              console.error(`Error sending to ${lead.email}:`, error.message)
            }
          }

          // Delay between batches
          if (i + BATCH_SIZE < leadsToSend.length) {
            await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS))
          }
        }

        // Update campaign status back to active
        await prisma.campaign.update({
          where: { id: campaign.id },
          data: { status: 'active' },
        })

        results.push({
          campaignId: campaign.id,
          campaignName: campaign.name,
          status: 'sent',
          sent,
          failed,
          total: leadsToSend.length,
        })

        // Update remaining quota
        const newEmailsSentToday = emailsSentToday + sent
        const newRemainingQuota = DAILY_EMAIL_LIMIT - newEmailsSentToday

        if (newRemainingQuota <= 0) {
          break // Stop if quota reached
        }
      } catch (error: any) {
        // Update campaign status back to active on error
        await prisma.campaign.update({
          where: { id: campaign.id },
          data: { status: 'active' },
        }).catch(() => {})

        results.push({
          campaignId: campaign.id,
          campaignName: campaign.name,
          status: 'error',
          error: error.message || 'Unknown error',
        })
      }
    }

    return NextResponse.json({
      message: 'Daily campaign sending completed',
      campaignsProcessed: results.length,
      results,
      dailyQuota: {
        used: emailsSentToday,
        limit: DAILY_EMAIL_LIMIT,
        remaining: remainingQuota,
      },
    })
  } catch (error: any) {
    console.error('Error in daily campaign cron:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process daily campaigns' },
      { status: 500 }
    )
  }
}

