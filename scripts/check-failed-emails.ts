import { prisma } from '../lib/prisma'

async function checkFailedEmails() {
  try {
    // Get failed emails from yesterday
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(0, 0, 0, 0)
    const today = new Date(yesterday)
    today.setDate(today.getDate() + 1)

    console.log(`Checking failed emails from ${yesterday.toISOString()} to ${today.toISOString()}\n`)

    // Get all failed emails
    const failedEmails = await prisma.emailLog.findMany({
      where: {
        status: 'failed',
        createdAt: {
          gte: yesterday,
          lt: today,
        },
      },
      include: {
        lead: {
          select: {
            email: true,
            businessName: true,
          },
        },
        campaign: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    console.log(`Total failed emails: ${failedEmails.length}\n`)

    if (failedEmails.length === 0) {
      console.log('No failed emails found for yesterday.')
      return
    }

    // Group errors by error message
    const errorGroups: Record<string, number> = {}
    const errorDetails: Record<string, string[]> = {}

    failedEmails.forEach((log) => {
      const error = log.errorMessage || 'No error message'
      errorGroups[error] = (errorGroups[error] || 0) + 1
      if (!errorDetails[error]) {
        errorDetails[error] = []
      }
      errorDetails[error].push(log.lead.email)
    })

    console.log('Error Summary:')
    console.log('='.repeat(80))
    Object.entries(errorGroups)
      .sort((a, b) => b[1] - a[1])
      .forEach(([error, count]) => {
        console.log(`\n${error}`)
        console.log(`  Count: ${count} emails`)
        console.log(`  Percentage: ${((count / failedEmails.length) * 100).toFixed(2)}%`)
        if (count <= 10) {
          console.log(`  Sample emails: ${errorDetails[error].slice(0, 5).join(', ')}`)
        }
      })

    // Get sent emails count for comparison
    const sentEmails = await prisma.emailLog.count({
      where: {
        status: 'sent',
        sentAt: {
          gte: yesterday,
          lt: today,
        },
      },
    })

    console.log('\n' + '='.repeat(80))
    console.log('\nSummary:')
    console.log(`  Sent: ${sentEmails}`)
    console.log(`  Failed: ${failedEmails.length}`)
    console.log(`  Total: ${sentEmails + failedEmails.length}`)
    console.log(`  Success Rate: ${((sentEmails / (sentEmails + failedEmails.length)) * 100).toFixed(2)}%`)

    // Check for common issues
    console.log('\n' + '='.repeat(80))
    console.log('\nCommon Issues Detected:')

    const allErrors = failedEmails.map((e) => (e.errorMessage || '').toLowerCase()).join(' ')

    if (allErrors.includes('rate limit') || allErrors.includes('too many') || allErrors.includes('quota')) {
      console.log('⚠️  RATE LIMIT ISSUE: Email provider is rate limiting your sends')
      console.log('   Solution: Reduce sending speed or upgrade your email plan')
    }

    if (allErrors.includes('invalid') || allErrors.includes('bad address')) {
      console.log('⚠️  INVALID EMAIL ADDRESSES: Some email addresses are invalid')
      console.log('   Solution: Validate email addresses before sending')
    }

    if (allErrors.includes('authentication') || allErrors.includes('login') || allErrors.includes('credentials')) {
      console.log('⚠️  AUTHENTICATION ISSUE: SMTP credentials may be incorrect')
      console.log('   Solution: Check your SMTP settings and credentials')
    }

    if (allErrors.includes('timeout') || allErrors.includes('connection')) {
      console.log('⚠️  CONNECTION ISSUE: Network or SMTP server connection problems')
      console.log('   Solution: Check network connectivity and SMTP server status')
    }

    if (allErrors.includes('spam') || allErrors.includes('blocked') || allErrors.includes('rejected')) {
      console.log('⚠️  SPAM/BLOCKING ISSUE: Emails are being blocked or marked as spam')
      console.log('   Solution: Check email content, improve sender reputation, warm up domain')
    }

    if (allErrors.includes('unknown') || allErrors.length === 0) {
      console.log('⚠️  UNKNOWN ERRORS: Some errors have no specific message')
      console.log('   Solution: Check server logs for more details')
    }
  } catch (error: any) {
    console.error('Error checking failed emails:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkFailedEmails()

