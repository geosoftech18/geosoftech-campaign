import { prisma } from '../lib/prisma'

async function testDailyCampaigns() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const cronSecret = process.env.CRON_SECRET || 'your-secret-key'

    console.log('Testing daily campaign sending...')
    console.log(`URL: ${baseUrl}/api/cron/daily-campaigns`)
    
    const response = await fetch(`${baseUrl}/api/cron/daily-campaigns`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${cronSecret}`,
      },
    })

    const data = await response.json()

    if (response.ok) {
      console.log('\n✅ Daily campaigns processed successfully!')
      console.log(JSON.stringify(data, null, 2))
    } else {
      console.error('\n❌ Error:', data)
    }
  } catch (error: any) {
    console.error('Error testing daily campaigns:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testDailyCampaigns()





