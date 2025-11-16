import { prisma } from '../lib/prisma'

async function analyzeEmailTiming() {
  try {
    // Get yesterday's date range
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(0, 0, 0, 0)
    const today = new Date(yesterday)
    today.setDate(today.getDate() + 1)

    console.log(`Analyzing email timing from ${yesterday.toISOString()} to ${today.toISOString()}\n`)

    // Get all emails from yesterday
    const allEmails = await prisma.emailLog.findMany({
      where: {
        createdAt: {
          gte: yesterday,
          lt: today,
        },
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
        sentAt: true,
        errorMessage: true,
        lead: {
          select: {
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    console.log(`Total emails attempted: ${allEmails.length}\n`)

    // Group by status
    const sent = allEmails.filter((e) => e.status === 'sent')
    const failed = allEmails.filter((e) => e.status === 'failed')

    console.log(`Sent: ${sent.length}`)
    console.log(`Failed: ${failed.length}\n`)

    // Analyze timing pattern
    console.log('='.repeat(80))
    console.log('TIMING ANALYSIS:')
    console.log('='.repeat(80))

    if (sent.length > 0) {
      const firstSent = sent[0]
      const lastSent = sent[sent.length - 1]
      console.log(`\n✅ First successful send: ${firstSent.createdAt.toISOString()}`)
      console.log(`✅ Last successful send: ${lastSent.createdAt.toISOString()}`)
      console.log(`✅ Successful sends duration: ${Math.round((lastSent.createdAt.getTime() - firstSent.createdAt.getTime()) / 1000 / 60)} minutes`)
    }

    if (failed.length > 0) {
      const firstFailed = failed[0]
      const lastFailed = failed[failed.length - 1]
      console.log(`\n❌ First failed send: ${firstFailed.createdAt.toISOString()}`)
      console.log(`❌ Last failed send: ${lastFailed.createdAt.toISOString()}`)
      console.log(`❌ Failed sends duration: ${Math.round((lastFailed.createdAt.getTime() - firstFailed.createdAt.getTime()) / 1000 / 60)} minutes`)
    }

    // Check if there's a pattern - did failures start after successes?
    if (sent.length > 0 && failed.length > 0) {
      const lastSentTime = sent[sent.length - 1].createdAt.getTime()
      const firstFailedTime = failed[0].createdAt.getTime()

      if (firstFailedTime > lastSentTime) {
        const gapMinutes = Math.round((firstFailedTime - lastSentTime) / 1000 / 60)
        console.log(`\n⚠️  PATTERN DETECTED:`)
        console.log(`   All ${sent.length} emails succeeded first`)
        console.log(`   Then ${failed.length} emails started failing`)
        console.log(`   Gap between last success and first failure: ${gapMinutes} minutes`)
        console.log(`\n   This suggests:`)
        console.log(`   - Gmail rate limit was hit after ${sent.length} emails`)
        console.log(`   - OR App Password was revoked/expired mid-campaign`)
        console.log(`   - OR Gmail temporarily blocked the account`)
      } else {
        console.log(`\n⚠️  MIXED PATTERN:`)
        console.log(`   Some emails succeeded and failed intermittently`)
        console.log(`   This suggests connection issues or intermittent Gmail problems`)
      }
    }

    // Analyze error messages by time
    console.log('\n' + '='.repeat(80))
    console.log('ERROR MESSAGE ANALYSIS BY TIME:')
    console.log('='.repeat(80))

    const authErrors = failed.filter((e) => e.errorMessage?.includes('authentication') || e.errorMessage?.includes('App Password'))
    const invalidErrors = failed.filter((e) => e.errorMessage?.includes('Invalid email'))

    if (authErrors.length > 0) {
      const firstAuthError = authErrors[0]
      const lastAuthError = authErrors[authErrors.length - 1]
      console.log(`\n🔐 Authentication Errors:`)
      console.log(`   Count: ${authErrors.length}`)
      console.log(`   First occurred: ${firstAuthError.createdAt.toISOString()}`)
      console.log(`   Last occurred: ${lastAuthError.createdAt.toISOString()}`)
    }

    if (invalidErrors.length > 0) {
      console.log(`\n📧 Invalid Email Errors:`)
      console.log(`   Count: ${invalidErrors.length}`)
    }

    // Check if authentication errors started after successful sends
    if (sent.length > 0 && authErrors.length > 0) {
      const lastSentTime = sent[sent.length - 1].createdAt.getTime()
      const firstAuthErrorTime = authErrors[0].createdAt.getTime()

      if (firstAuthErrorTime > lastSentTime) {
        const gapMinutes = Math.round((firstAuthErrorTime - lastSentTime) / 1000 / 60)
        console.log(`\n🎯 KEY FINDING:`)
        console.log(`   ${sent.length} emails succeeded BEFORE authentication errors started`)
        console.log(`   This means:`)
        console.log(`   1. App Password was CORRECT initially`)
        console.log(`   2. Something changed after ${sent.length} emails`)
        console.log(`   3. Most likely: Gmail rate limit or account restriction`)
        console.log(`\n   Gmail limits:`)
        console.log(`   - Regular Gmail: 500 emails/day via SMTP`)
        console.log(`   - Google Workspace: 2000 emails/day`)
        console.log(`   - Per-minute limits also apply`)
      }
    }

    // Show sample of successful vs failed emails
    console.log('\n' + '='.repeat(80))
    console.log('SAMPLE EMAILS:')
    console.log('='.repeat(80))
    console.log('\n✅ Sample successful emails:')
    sent.slice(0, 5).forEach((e, i) => {
      console.log(`   ${i + 1}. ${e.lead.email} - ${e.createdAt.toISOString()}`)
    })

    if (authErrors.length > 0) {
      console.log('\n❌ Sample authentication errors:')
      authErrors.slice(0, 5).forEach((e, i) => {
        console.log(`   ${i + 1}. ${e.lead.email} - ${e.createdAt.toISOString()}`)
        console.log(`      Error: ${e.errorMessage}`)
      })
    }
  } catch (error: any) {
    console.error('Error analyzing email timing:', error)
  } finally {
    await prisma.$disconnect()
  }
}

analyzeEmailTiming()

