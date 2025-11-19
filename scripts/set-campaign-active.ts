import { prisma } from '../lib/prisma'

async function setCampaignActive() {
  try {
    // Find the campaign
    const campaign = await prisma.campaign.findFirst({
      where: {
        status: { in: ['sending', 'paused', 'completed'] },
      },
    })

    if (!campaign) {
      console.log('No campaign found to activate.')
      return
    }

    console.log(`Found campaign: ${campaign.name} (ID: ${campaign.id})`)
    console.log(`Current status: ${campaign.status}`)

    // Update to active
    await prisma.campaign.update({
      where: { id: campaign.id },
      data: { status: 'active' },
    })

    console.log('\n✅ Campaign status changed to "active"')
    console.log('   The campaign will now send daily automatically via cron job at 9:00 AM')
  } catch (error: any) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setCampaignActive()


