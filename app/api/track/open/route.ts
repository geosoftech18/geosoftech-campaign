import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const leadId = searchParams.get('leadId')

    if (!leadId) {
      return new NextResponse(null, { status: 400 })
    }

    // Find the most recent email log for this lead that hasn't been opened yet
    const emailLog = await prisma.emailLog.findFirst({
      where: {
        leadId,
        status: { in: ['sent', 'pending'] },
        openedAt: null,
      },
      orderBy: { sentAt: 'desc' },
    })

    if (emailLog) {
      await prisma.emailLog.update({
        where: { id: emailLog.id },
        data: {
          status: 'opened',
          openedAt: new Date(),
        },
      })
      console.log(`Email opened tracked: leadId=${leadId}, emailLogId=${emailLog.id}`)
    } else {
      console.warn(`No email log found for open tracking: leadId=${leadId}`)
    }

    // Return a 1x1 transparent pixel
    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    )

    return new NextResponse(pixel, {
      status: 200,
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  } catch (error) {
    console.error('Error tracking email open:', error)
    // Still return pixel even on error
    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    )
    return new NextResponse(pixel, {
      status: 200,
      headers: { 'Content-Type': 'image/gif' },
    })
  }
}


