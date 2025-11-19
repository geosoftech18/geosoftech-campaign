import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { buildSegmentFilter } from '@/lib/segmenter'

const DAILY_EMAIL_LIMIT = 700

/**
 * Preview endpoint to show how many emails will be sent
 * GET /api/campaigns/[id]/send/preview
 */
export async function GET(
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

    // Build segment filter (including group if specified)
    const segmentFilter = buildSegmentFilter(
      campaign.segmentCity,
      campaign.segmentState,
      campaign.segmentCategory,
      campaign.segmentGroupId || null
    )

    // Get all leads matching segment
    const allMatchingLeads = await prisma.lead.findMany({
      where: segmentFilter,
    })

    // Get leads that already received an email from THIS campaign (not all campaigns)
    const leadsSentFromThisCampaign = await prisma.emailLog.findMany({
      where: {
        campaignId: id,
        status: 'sent',
      },
      select: {
        leadId: true,
      },
      distinct: ['leadId'],
    })

    const sentLeadIds = new Set(leadsSentFromThisCampaign.map((log) => log.leadId))

    // Filter out leads that already received an email from this campaign
    const availableLeads = allMatchingLeads.filter((lead) => !sentLeadIds.has(lead.id))

    // Calculate how many will actually be sent (limited by quota)
    const willSend = Math.min(availableLeads.length, Math.max(0, remainingQuota))

    return NextResponse.json({
      totalLeads: allMatchingLeads.length,
      availableLeads: availableLeads.length,
      emailsSentToday,
      dailyLimit: DAILY_EMAIL_LIMIT,
      remainingQuota,
      willSend,
    })
  } catch (error: any) {
    console.error('Error fetching preview:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch preview' },
      { status: 500 }
    )
  }
}

