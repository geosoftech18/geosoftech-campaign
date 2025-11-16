import { prisma } from '../lib/prisma'

async function pauseCampaign() {
  try {
    // Find the campaign that's currently sending
    const sendingCampaign = await prisma.campaign.findFirst({
      where: {
        status: 'sending',
      },
    })

    if (!sendingCampaign) {
      console.log('No campaign is currently being sent.')
      return
    }

    console.log(`Found sending campaign: ${sendingCampaign.name} (ID: ${sendingCampaign.id})`)
    
    // Update status to paused
    await prisma.campaign.update({
      where: { id: sendingCampaign.id },
      data: { status: 'paused' },
    })

    console.log('✅ Campaign paused successfully!')
    console.log('   Note: Emails currently in progress will complete, but no new emails will be sent.')
    console.log('   To resume, change status back to "draft" and send again.')
  } catch (error: any) {
    console.error('Error pausing campaign:', error)
  } finally {
    await prisma.$disconnect()
  }
}

pauseCampaign()

