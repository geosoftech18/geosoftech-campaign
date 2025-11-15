import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import Papa from 'papaparse'

const prisma = new PrismaClient()

interface LeadRow {
  BusinessName?: string
  Email?: string
  Telephone?: string
  WebsiteURL?: string
  Linkedin?: string
  Address?: string
  Category?: string
  City?: string
  State?: string
}

interface ParsedLead {
  businessName: string
  email: string
  telephone?: string
  websiteURL?: string
  linkedin?: string
  address?: string
  category?: string
  city?: string
  state?: string
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

async function importFromCSV(filePath: string) {
  console.log(`Reading CSV file: ${filePath}`)
  const fileContent = fs.readFileSync(filePath, 'utf-8')

  return new Promise<{ leads: ParsedLead[]; errors: string[] }>((resolve) => {
    const leads: ParsedLead[] = []
    const errors: string[] = []
    const seenEmails = new Set<string>()

    Papa.parse<LeadRow>(fileContent, {
      header: true,
      skipEmptyLines: true,
      step: (result) => {
        const row = result.data
        const email = row.Email?.trim()
        const businessName = row.BusinessName?.trim()

        if (!email) {
          errors.push(`Row ${result.meta.cursor}: Missing email`)
          return
        }

        if (!isValidEmail(email)) {
          errors.push(`Row ${result.meta.cursor}: Invalid email format: ${email}`)
          return
        }

        if (!businessName) {
          errors.push(`Row ${result.meta.cursor}: Missing business name`)
          return
        }

        const emailLower = email.toLowerCase()
        if (seenEmails.has(emailLower)) {
          errors.push(`Row ${result.meta.cursor}: Duplicate email: ${email}`)
          return
        }

        seenEmails.add(emailLower)

        leads.push({
          businessName,
          email: emailLower,
          telephone: row.Telephone?.toString().trim() || undefined,
          websiteURL: row.WebsiteURL?.trim() || undefined,
          linkedin: row.Linkedin?.trim() || undefined,
          address: row.Address?.trim() || undefined,
          category: row.Category?.trim() || undefined,
          city: row.City?.trim() || undefined,
          state: row.State?.trim() || undefined,
        })
      },
      complete: () => {
        resolve({ leads, errors })
      },
      error: (error) => {
        errors.push(`CSV Parse Error: ${error.message}`)
        resolve({ leads, errors })
      },
    })
  })
}

async function importFromJSON(filePath: string) {
  console.log(`Reading JSON file: ${filePath}`)
  const fileContent = fs.readFileSync(filePath, 'utf-8')
  const data: LeadRow[] = JSON.parse(fileContent)

  const leads: ParsedLead[] = []
  const errors: string[] = []
  const seenEmails = new Set<string>()

  data.forEach((row, index) => {
    const email = row.Email?.toString().trim()
    const businessName = row.BusinessName?.toString().trim()

    if (!email) {
      errors.push(`Row ${index + 1}: Missing email`)
      return
    }

    if (!isValidEmail(email)) {
      errors.push(`Row ${index + 1}: Invalid email format: ${email}`)
      return
    }

    if (!businessName) {
      errors.push(`Row ${index + 1}: Missing business name`)
      return
    }

    const emailLower = email.toLowerCase()
    if (seenEmails.has(emailLower)) {
      errors.push(`Row ${index + 1}: Duplicate email: ${email}`)
      return
    }

    seenEmails.add(emailLower)

    leads.push({
      businessName,
      email: emailLower,
      telephone: row.Telephone?.toString().trim() || undefined,
      websiteURL: row.WebsiteURL?.toString().trim() || undefined,
      linkedin: row.Linkedin?.toString().trim() || undefined,
      address: row.Address?.toString().trim() || undefined,
      category: row.Category?.toString().trim() || undefined,
      city: row.City?.toString().trim() || undefined,
      state: row.State?.toString().trim() || undefined,
    })
  })

  return { leads, errors }
}

async function importLeads(leads: ParsedLead[], batchSize: number = 100) {
  let imported = 0
  let duplicates = 0
  let errors = 0

  console.log(`\nImporting ${leads.length} leads in batches of ${batchSize}...`)

  for (let i = 0; i < leads.length; i += batchSize) {
    const batch = leads.slice(i, i + batchSize)
    const batchNum = Math.floor(i / batchSize) + 1
    const totalBatches = Math.ceil(leads.length / batchSize)

    console.log(`Processing batch ${batchNum}/${totalBatches} (${batch.length} leads)...`)

    for (const lead of batch) {
      try {
        await prisma.lead.upsert({
          where: { email: lead.email },
          update: {
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
      } catch (error: any) {
        if (error.code === 'P2002') {
          duplicates++
        } else {
          console.error(`Error importing ${lead.email}:`, error.message)
          errors++
        }
      }
    }

    // Progress update
    if ((i + batchSize) % 1000 === 0 || i + batchSize >= leads.length) {
      console.log(`Progress: ${Math.min(i + batchSize, leads.length)}/${leads.length} processed`)
    }
  }

  return { imported, duplicates, errors }
}

async function main() {
  const args = process.argv.slice(2)
  const filePath = args[0]

  if (!filePath) {
    console.error('Usage: tsx scripts/import-leads.ts <path-to-csv-or-json>')
    console.error('Example: tsx scripts/import-leads.ts filtered_leads_city_state.csv')
    process.exit(1)
  }

  const fullPath = path.resolve(filePath)

  if (!fs.existsSync(fullPath)) {
    console.error(`File not found: ${fullPath}`)
    process.exit(1)
  }

  const isJSON = fullPath.endsWith('.json')
  const isCSV = fullPath.endsWith('.csv')

  if (!isJSON && !isCSV) {
    console.error('File must be either .csv or .json')
    process.exit(1)
  }

  try {
    console.log('='.repeat(60))
    console.log('LeadMailer - Bulk Import Script')
    console.log('='.repeat(60))

    // Parse file
    const { leads, errors: parseErrors } = isJSON
      ? await importFromJSON(fullPath)
      : await importFromCSV(fullPath)

    console.log(`\nParsed ${leads.length} valid leads`)
    if (parseErrors.length > 0) {
      console.log(`⚠️  ${parseErrors.length} parsing errors (see below)`)
      if (parseErrors.length <= 20) {
        parseErrors.forEach((err) => console.log(`  - ${err}`))
      } else {
        parseErrors.slice(0, 20).forEach((err) => console.log(`  - ${err}`))
        console.log(`  ... and ${parseErrors.length - 20} more errors`)
      }
    }

    if (leads.length === 0) {
      console.log('\n❌ No valid leads to import')
      process.exit(1)
    }

    // Import to database
    const { imported, duplicates, errors } = await importLeads(leads, 100)

    console.log('\n' + '='.repeat(60))
    console.log('Import Summary')
    console.log('='.repeat(60))
    console.log(`✅ Successfully imported: ${imported}`)
    console.log(`⚠️  Duplicates skipped: ${duplicates}`)
    console.log(`❌ Errors: ${errors}`)
    console.log(`📊 Total processed: ${leads.length}`)
    console.log('='.repeat(60))
  } catch (error: any) {
    console.error('Fatal error:', error.message)
    console.error(error.stack)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()


