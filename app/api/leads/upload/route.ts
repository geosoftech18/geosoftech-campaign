import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseCSV } from '@/lib/csvParser'

export async function POST(request: NextRequest) {
  try {

    const formData = await request.formData()
    const file = formData.get('file') as File
    const groupId = formData.get('groupId') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const { leads, errors } = await parseCSV(file)

    if (leads.length === 0) {
      return NextResponse.json(
        { error: 'No valid leads found in CSV', errors },
        { status: 400 }
      )
    }

    // Insert leads (upsert by email to avoid duplicates)
    let imported = 0
    let duplicates = 0
    const importedLeadIds: string[] = []

    for (const lead of leads) {
      try {
        const result = await prisma.lead.upsert({
          where: { email: lead.email },
          update: {
            name: lead.name,
            businessName: lead.businessName,
            telephone: lead.telephone,
            websiteURL: lead.websiteURL,
            linkedin: lead.linkedin,
            address: lead.address,
            category: lead.category,
            city: lead.city,
            state: lead.state,
          },
          create: lead,
        })
        imported++
        importedLeadIds.push(result.id)
      } catch (error: any) {
        if (error.code === 'P2002') {
          duplicates++
          // Get existing lead ID for group assignment
          const existingLead = await prisma.lead.findUnique({
            where: { email: lead.email },
            select: { id: true },
          })
          if (existingLead) {
            importedLeadIds.push(existingLead.id)
          }
        } else {
          throw error
        }
      }
    }

    // Add leads to group if groupId provided
    if (groupId && importedLeadIds.length > 0) {
      try {
        await Promise.allSettled(
          importedLeadIds.map((leadId) =>
            (prisma as any).leadGroupLead.create({
              data: {
                leadId,
                groupId,
              },
            })
          )
        )
      } catch (error) {
        // Ignore group assignment errors (duplicates are fine)
        console.warn('Some leads could not be added to group:', error)
      }
    }

    return NextResponse.json({
      message: `Successfully imported ${imported} leads. ${duplicates} duplicates skipped.`,
      imported,
      duplicates,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to upload leads' },
      { status: 500 }
    )
  }
}

