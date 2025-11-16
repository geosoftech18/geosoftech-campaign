import { prisma } from '../lib/prisma'

async function checkAndResume() {
  try {
    // Find the campaign
    const campaign = await prisma.campaign.findFirst({
      where: {
        name: 'geosoftech',
      },
    })

    if (!campaign) {
      console.log('Campaign not found.')
      return
    }

    console.log(`\n📊 Campaign Status:`)
    console.log(`   Name: ${campaign.name}`)
    console.log(`   ID: ${campaign.id}`)
    console.log(`   Current Status: ${campaign.status}`)
    
    // Count emails already sent
    const emailsSent = await prisma.emailLog.count({
      where: {
        campaignId: campaign.id,
        status: 'sent',
      },
    })

    console.log(`   Emails already sent: ${emailsSent}`)
    
    // Update status to draft if it's paused or completed
    if (campaign.status === 'paused' || campaign.status === 'completed') {
      await prisma.campaign.update({
        where: { id: campaign.id },
        data: { status: 'draft' },
      })
      console.log(`\n✅ Campaign status changed to "draft"`)
    } else if (campaign.status === 'sending') {
      console.log(`\n⚠️  Campaign is currently sending. Wait for it to complete or pause it first.`)
      return
    } else {
      console.log(`\n✅ Campaign is already in "${campaign.status}" status - ready to send!`)
    }

    console.log(`\n📝 Next Steps:`)
    console.log(`   1. Go to: http://localhost:3001/dashboard/campaigns`)
    console.log(`   2. Find campaign: "${campaign.name}"`)
    console.log(`   3. Click "Send Campaign"`)
    console.log(`   4. The system will skip ${emailsSent} already-sent emails`)
    console.log(`   5. Continue with remaining leads (up to 700/day limit)`)
  } catch (error: any) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAndResume()

