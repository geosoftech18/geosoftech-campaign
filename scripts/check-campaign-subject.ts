import { prisma } from '../lib/prisma'

async function checkCampaignSubject() {
  try {
    const campaigns = await prisma.campaign.findMany({
      select: {
        id: true,
        name: true,
        subject: true,
      },
    })

    console.log('Campaign Subjects:')
    console.log('='.repeat(80))
    
    campaigns.forEach((campaign) => {
      console.log(`\nCampaign: ${campaign.name} (ID: ${campaign.id})`)
      console.log(`Subject: "${campaign.subject}"`)
      
      // Check for common issues
      if (campaign.subject.includes('{{BussinessName}}')) {
        console.log('⚠️  TYPO DETECTED: "{{BussinessName}}" should be "{{BusinessName}}"')
      }
      if (campaign.subject.includes('{{businessName}}')) {
        console.log('ℹ️  Lowercase detected: "{{businessName}}" (will work with new code)')
      }
      if (campaign.subject.includes('{{BusinessName}}')) {
        console.log('✅ Correct format: "{{BusinessName}}"')
      }
      if (campaign.subject.includes('{{') && !campaign.subject.includes('BusinessName')) {
        console.log('⚠️  Has placeholders but not BusinessName')
      }
    })
  } catch (error: any) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkCampaignSubject()

