import { prisma } from '../lib/prisma'

async function checkStatus() {
  try {
    const campaigns = await prisma.campaign.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        _count: {
          select: { emailLogs: true },
        },
      },
    })

    console.log('\n📊 Campaign Status:\n')
    campaigns.forEach((campaign) => {
      console.log(`  ${campaign.name}:`)
      console.log(`    Status: ${campaign.status}`)
      console.log(`    Emails Sent: ${campaign._count.emailLogs}`)
      console.log('')
    })
  } catch (error: any) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkStatus()




