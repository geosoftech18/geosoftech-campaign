import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const leadId = searchParams.get('leadId')
    const url = searchParams.get('url')

    if (!leadId || !url) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Find the most recent email log for this lead
    const emailLog = await prisma.emailLog.findFirst({
      where: {
        leadId,
        status: { in: ['sent', 'opened', 'pending'] },
      },
      orderBy: { sentAt: 'desc' },
    })

    if (emailLog) {
      await prisma.emailLog.update({
        where: { id: emailLog.id },
        data: {
          status: 'clicked',
          clickedAt: new Date(),
        },
      })
      console.log(`Email click tracked: leadId=${leadId}, emailLogId=${emailLog.id}, url=${url}`)
    } else {
      console.warn(`No email log found for click tracking: leadId=${leadId}, url=${url}`)
    }

    // Redirect to the actual URL
    return NextResponse.redirect(decodeURIComponent(url))
  } catch (error) {
    console.error('Error tracking click:', error)
    // Try to redirect anyway
    const url = request.nextUrl.searchParams.get('url')
    if (url) {
      return NextResponse.redirect(decodeURIComponent(url))
    }
    return NextResponse.redirect(new URL('/', request.url))
  }
}


