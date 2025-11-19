import { prisma } from '../lib/prisma'

async function activateCompletedCampaigns() {
  try {
    // Find all completed campaigns
    const completedCampaigns = await prisma.campaign.findMany({
      where: {
        status: 'completed',
      },
    })

    if (completedCampaigns.length === 0) {
      console.log('No completed campaigns found.')
      return
    }

    console.log(`Found ${completedCampaigns.length} completed campaign(s):`)
    completedCampaigns.forEach((campaign) => {
      console.log(`  - ${campaign.name} (ID: ${campaign.id})`)
    })

    // Update all to 'active' status
    const result = await prisma.campaign.updateMany({
      where: {
        status: 'completed',
      },
      data: {
        status: 'active',
      },
    })

    console.log(`\n✅ Updated ${result.count} campaign(s) from 'completed' to 'active' status.`)
    console.log('   These campaigns can now be sent daily.')
  } catch (error: any) {
    console.error('Error activating campaigns:', error)
  } finally {
    await prisma.$disconnect()
  }
}

activateCompletedCampaigns()





