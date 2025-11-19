import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Add leads to a group
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { leadIds } = await request.json()

    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json(
        { error: 'Lead IDs array is required' },
        { status: 400 }
      )
    }

    // Check if group exists
    const group = await (prisma as any).leadGroup.findUnique({
      where: { id },
    })

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    // Add leads to group (skip duplicates)
    const results = await Promise.allSettled(
      leadIds.map((leadId: string) =>
        (prisma as any).leadGroupLead.create({
          data: {
            leadId,
            groupId: id,
          },
        })
      )
    )

    const added = results.filter((r) => r.status === 'fulfilled').length
    const skipped = results.filter(
      (r) => r.status === 'rejected' && (r.reason as any)?.code === 'P2002'
    ).length

    return NextResponse.json({
      message: `Added ${added} leads to group. ${skipped} duplicates skipped.`,
      added,
      skipped,
    })
  } catch (error: any) {
    console.error('Error adding leads to group:', error)
    return NextResponse.json(
      { error: 'Failed to add leads to group' },
      { status: 500 }
    )
  }
}

// DELETE - Remove leads from a group
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const leadId = searchParams.get('leadId')

    if (!leadId) {
      return NextResponse.json(
        { error: 'Lead ID is required' },
        { status: 400 }
      )
    }

    await (prisma as any).leadGroupLead.deleteMany({
      where: {
        groupId: id,
        leadId,
      },
    })

    return NextResponse.json({ message: 'Lead removed from group' })
  } catch (error: any) {
    console.error('Error removing lead from group:', error)
    return NextResponse.json(
      { error: 'Failed to remove lead from group' },
      { status: 500 }
    )
  }
}


