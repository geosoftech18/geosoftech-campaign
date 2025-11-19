import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {

    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        businessName: true,
        email: true,
        telephone: true,
        city: true,
        state: true,
        category: true,
      },
    })

    return NextResponse.json({ leads })
  } catch (error: any) {
    console.error('Error fetching leads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      businessName,
      email,
      telephone,
      websiteURL,
      linkedin,
      address,
      category,
      city,
      state,
      groupId,
    } = body

    if (!businessName || !email) {
      return NextResponse.json(
        { error: 'Business name and email are required' },
        { status: 400 }
      )
    }

    // Create or update lead
    const lead = await prisma.lead.upsert({
      where: { email: email.toLowerCase() },
      update: {
        name: name || null,
        businessName,
        telephone: telephone || null,
        websiteURL: websiteURL || null,
        linkedin: linkedin || null,
        address: address || null,
        category: category || null,
        city: city || null,
        state: state || null,
      },
      create: {
        name: name || null,
        businessName,
        email: email.toLowerCase(),
        telephone: telephone || null,
        websiteURL: websiteURL || null,
        linkedin: linkedin || null,
        address: address || null,
        category: category || null,
        city: city || null,
        state: state || null,
      },
    })

    // Add to group if groupId provided
    if (groupId) {
      try {
        await (prisma as any).leadGroupLead.create({
          data: {
            leadId: lead.id,
            groupId,
          },
        })
      } catch (error: any) {
        // Ignore if already in group (P2002)
        if (error.code !== 'P2002') {
          throw error
        }
      }
    }

    return NextResponse.json({ lead })
  } catch (error: any) {
    console.error('Error creating lead:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create lead' },
      { status: 500 }
    )
  }
}

