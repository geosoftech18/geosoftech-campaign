import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get group details with leads
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const group = await (prisma as any).leadGroup.findUnique({
      where: { id },
      include: {
        leads: {
          include: {
            lead: true,
          },
        },
        _count: {
          select: {
            leads: true,
          },
        },
      },
    })

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    return NextResponse.json({ group })
  } catch (error: any) {
    console.error('Error fetching group:', error)
    return NextResponse.json(
      { error: 'Failed to fetch group' },
      { status: 500 }
    )
  }
}

// PUT - Update group
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { name, description } = await request.json()

    const group = await (prisma as any).leadGroup.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
      },
    })

    return NextResponse.json({ group })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Group name already exists' },
        { status: 400 }
      )
    }
    console.error('Error updating group:', error)
    return NextResponse.json(
      { error: 'Failed to update group' },
      { status: 500 }
    )
  }
}

// DELETE - Delete group
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await (prisma as any).leadGroup.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Group deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting group:', error)
    return NextResponse.json(
      { error: 'Failed to delete group' },
      { status: 500 }
    )
  }
}


