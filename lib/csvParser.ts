import Papa from 'papaparse'

export interface LeadCSVRow {
  Name?: string
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

export interface ParsedLead {
  name?: string
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

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Parses CSV file and returns validated leads
 */
export async function parseCSV(file: File): Promise<{
  leads: ParsedLead[]
  errors: string[]
}> {
  return new Promise((resolve) => {
    const leads: ParsedLead[] = []
    const errors: string[] = []
    const seenEmails = new Set<string>()

    Papa.parse<LeadCSVRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        results.data.forEach((row, index) => {
          const email = row.Email?.trim()
          const businessName = row.BusinessName?.trim()
          const name = row.Name?.trim()

          // Validate required fields
          if (!email) {
            errors.push(`Row ${index + 2}: Missing email`)
            return
          }

          if (!isValidEmail(email)) {
            errors.push(`Row ${index + 2}: Invalid email format: ${email}`)
            return
          }

          if (!businessName) {
            errors.push(`Row ${index + 2}: Missing business name`)
            return
          }

          // Check for duplicates
          if (seenEmails.has(email.toLowerCase())) {
            errors.push(`Row ${index + 2}: Duplicate email: ${email}`)
            return
          }

          seenEmails.add(email.toLowerCase())

          leads.push({
            name: name || undefined,
            businessName,
            email: email.toLowerCase(),
            telephone: row.Telephone?.trim() || undefined,
            websiteURL: row.WebsiteURL?.trim() || undefined,
            linkedin: row.Linkedin?.trim() || undefined,
            address: row.Address?.trim() || undefined,
            category: row.Category?.trim() || undefined,
            city: row.City?.trim() || undefined,
            state: row.State?.trim() || undefined,
          })
        })

        resolve({ leads, errors })
      },
      error: (error) => {
        errors.push(`CSV Parse Error: ${error.message}`)
        resolve({ leads, errors })
      },
    })
  })
}


