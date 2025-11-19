import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - List all groups
export async function GET() {
  try {
    const groups = await (prisma as any).leadGroup.findMany({
      include: {
        _count: {
          select: {
            leads: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ groups })
  } catch (error: any) {
    console.error('Error fetching groups:', error)
    if (error.message?.includes('leadGroup') || error.message?.includes('Cannot read') || error.message?.includes('undefined')) {
      return NextResponse.json(
        { 
          error: 'Prisma client needs to be regenerated. Please follow these steps:',
          steps: [
            '1. Stop your Next.js dev server (Ctrl+C)',
            '2. Run: npx prisma generate',
            '3. Restart your dev server: npm run dev'
          ],
          details: error.message
        },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to fetch groups', details: error.message },
      { status: 500 }
    )
  }
}

// POST - Create a new group
export async function POST(request: NextRequest) {
  try {
    const { name, description } = await request.json()

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Group name is required' },
        { status: 400 }
      )
    }

    const group = await (prisma as any).leadGroup.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
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
    console.error('Error creating group:', error)
    return NextResponse.json(
      { error: 'Failed to create group' },
      { status: 500 }
    )
  }
}


