import { prisma } from '../lib/prisma'
import { getSMTPConfig, sendEmailToLead, replaceTemplateVariables } from '../lib/emailSender'

async function sendTestEmail() {
  try {
    // Get the most recent campaign
    const campaign = await prisma.campaign.findFirst({
      orderBy: { createdAt: 'desc' },
    })

    if (!campaign) {
      console.error('No campaigns found. Please create a campaign first.')
      process.exit(1)
    }

    console.log(`Using campaign: ${campaign.name} (ID: ${campaign.id})`)

    // Test email address
    const testEmail = 'amarkorde18@gmail.com'

    // Get SMTP config
    const smtpConfig = await getSMTPConfig()

    // Get base URL for tracking
    const baseUrl = 
      process.env.NEXTAUTH_URL || 
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'http://localhost:3000'
    
    console.log('Using baseUrl for tracking:', baseUrl)
    console.log('Sending test email to:', testEmail)

    // Create a mock lead for testing
    const testLead = {
      id: 'test-lead-' + Date.now(),
      email: testEmail,
      businessName: 'Test Business',
      city: 'Test City',
      state: 'Test State',
      category: 'Test Category',
    }

    // Preview the replaced subject
    const replacedSubject = replaceTemplateVariables(campaign.subject || '', {
      BusinessName: testLead.businessName,
      City: testLead.city || '',
      State: testLead.state || '',
      Category: testLead.category || '',
    })

    console.log(`\n📧 Email Preview:`)
    console.log(`   Original Subject: "${campaign.subject}"`)
    console.log(`   Replaced Subject: "${replacedSubject}"`)

    // Send test email
    const result = await sendEmailToLead(
      smtpConfig,
      testLead,
      {
        id: campaign.id,
        subject: campaign.subject,
        body: campaign.body,
      },
      baseUrl
    )

    if (result.success) {
      console.log('\n✅ Test email sent successfully!')
      console.log(`   Campaign: ${campaign.name}`)
      console.log(`   To: ${testEmail}`)
      console.log(`   Subject (sent): "${replacedSubject}"`)
      console.log(`\n💡 Check your inbox - the email subject should show: "${replacedSubject}"`)
    } else {
      console.error('\n❌ Failed to send test email:', result.error)
      process.exit(1)
    }
  } catch (error: any) {
    console.error('Error sending test email:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

sendTestEmail()

