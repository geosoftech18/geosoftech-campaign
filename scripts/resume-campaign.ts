import { prisma } from '../lib/prisma'

async function resumeCampaign() {
  try {
    // Find paused campaign
    const pausedCampaign = await prisma.campaign.findFirst({
      where: {
        status: 'paused',
      },
    })

    if (!pausedCampaign) {
      console.log('No paused campaign found.')
      return
    }

    console.log(`Found paused campaign: ${pausedCampaign.name} (ID: ${pausedCampaign.id})`)
    
    // Count how many emails were already sent
    const emailsSent = await prisma.emailLog.count({
      where: {
        campaignId: pausedCampaign.id,
        status: 'sent',
      },
    })

    console.log(`\n📊 Campaign Status:`)
    console.log(`   Emails already sent: ${emailsSent}`)
    console.log(`   Status: ${pausedCampaign.status}`)
    
    // Update status back to draft so it can be sent again
    await prisma.campaign.update({
      where: { id: pausedCampaign.id },
      data: { status: 'draft' },
    })

    console.log('\n✅ Campaign status changed to "draft"')
    console.log('\n📝 Next Steps:')
    console.log('   1. Go to your dashboard: http://localhost:3001/dashboard/campaigns')
    console.log(`   2. Find campaign: "${pausedCampaign.name}"`)
    console.log('   3. Click "Send Campaign"')
    console.log('   4. The system will automatically skip leads that already received emails')
    console.log(`\n   Note: ${emailsSent} emails were already sent. The campaign will continue with remaining leads.`)
  } catch (error: any) {
    console.error('Error resuming campaign:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resumeCampaign()

