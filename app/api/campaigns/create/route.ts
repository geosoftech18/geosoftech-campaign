import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {

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

    if (!name || !subject || !body) {
      return NextResponse.json(
        { error: 'Name, subject, and body are required' },
        { status: 400 }
      )
    }

    const campaign = await prisma.campaign.create({
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
        status: 'draft',
      },
    })

    return NextResponse.json({ campaign })
  } catch (error: any) {
    console.error('Error creating campaign:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create campaign' },
      { status: 500 }
    )
  }
}

