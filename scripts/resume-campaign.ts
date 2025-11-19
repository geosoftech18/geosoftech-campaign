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
    
    // Update status to 'active' so it can be sent daily
    await prisma.campaign.update({
      where: { id: pausedCampaign.id },
      data: { status: 'active' },
    })

    console.log('\n✅ Campaign status changed to "active"')
    
    // Try to automatically trigger sending
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const sendUrl = `${baseUrl}/api/campaigns/${pausedCampaign.id}/send`
    
    console.log(`\n🚀 Attempting to automatically resume sending...`)
    console.log(`   API URL: ${sendUrl}`)
    
    try {
      const response = await fetch(sendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('\n✅ Campaign sending resumed successfully!')
        console.log(`   The campaign will continue sending in the background.`)
        if (result.sent !== undefined) {
          console.log(`   Note: ${emailsSent} emails were already sent. The campaign will continue with remaining leads.`)
        }
      } else {
        let errorMessage = 'Unknown error'
        try {
          const error = await response.json()
          errorMessage = error.error || errorMessage
        } catch {
          const text = await response.text()
          errorMessage = text.substring(0, 100) || errorMessage
        }
        console.log(`\n⚠️  Could not automatically trigger sending: ${errorMessage}`)
        console.log('\n📝 Manual Steps:')
        console.log('   1. Go to your dashboard: http://localhost:3000/dashboard/campaigns')
        console.log(`   2. Find campaign: "${pausedCampaign.name}"`)
        console.log('   3. Click "Send Campaign" or "Send Again"')
        console.log('   4. The system will automatically skip leads that already received emails')
        console.log('   5. Campaign is now "active" and will send daily automatically via cron job')
      }
    } catch (fetchError: any) {
      console.log(`\n⚠️  Could not automatically trigger sending: ${fetchError.message}`)
      console.log('   This usually means the server is not running or there was a network error.')
      console.log('\n📝 Manual Steps:')
      console.log('   1. Make sure your Next.js server is running (npm run dev)')
      console.log('   2. Go to your dashboard: http://localhost:3000/dashboard/campaigns')
      console.log(`   3. Find campaign: "${pausedCampaign.name}"`)
      console.log('   4. Click "Send Campaign" or "Send Again"')
      console.log('   5. The system will automatically skip leads that already received emails')
      console.log(`\n   Note: ${emailsSent} emails were already sent. The campaign will continue with remaining leads.`)
      console.log('   Campaign is now "active" and will send daily automatically via cron job at 9:00 AM')
    }
  } catch (error: any) {
    console.error('Error resuming campaign:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resumeCampaign()

