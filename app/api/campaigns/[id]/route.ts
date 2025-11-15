import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        _count: {
          select: { emailLogs: true },
        },
      },
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    return NextResponse.json({ campaign })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch campaign' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const requestBody = await request.json()
    const {
      name,
      subject,
      body,
      segmentCity,
      segmentState,
      segmentCategory,
      followUp1Days,
      followUp2Days,
      followUp3Days,
      followUp4Days,
      reEngagementDays,
      followUp1Subject,
      followUp1Body,
      followUp2Subject,
      followUp2Body,
      followUp3Subject,
      followUp3Body,
      followUp4Subject,
      followUp4Body,
      reEngagementSubject,
      reEngagementBody,
    } = requestBody

    const campaign = await prisma.campaign.update({
      where: { id },
      data: {
        name,
        subject,
        body,
        segmentCity: segmentCity || null,
        segmentState: segmentState || null,
        segmentCategory: segmentCategory || null,
        followUp1Days: followUp1Days || null,
        followUp2Days: followUp2Days || null,
        followUp3Days: followUp3Days || null,
        followUp4Days: followUp4Days || null,
        reEngagementDays: reEngagementDays || null,
        followUp1Subject: followUp1Subject || null,
        followUp1Body: followUp1Body || null,
        followUp2Subject: followUp2Subject || null,
        followUp2Body: followUp2Body || null,
        followUp3Subject: followUp3Subject || null,
        followUp3Body: followUp3Body || null,
        followUp4Subject: followUp4Subject || null,
        followUp4Body: followUp4Body || null,
        reEngagementSubject: reEngagementSubject || null,
        reEngagementBody: reEngagementBody || null,
      },
    })

    return NextResponse.json({ campaign })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update campaign' },
      { status: 500 }
    )
  }
}

