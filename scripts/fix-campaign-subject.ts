import { prisma } from '../lib/prisma'

async function fixCampaignSubject() {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: '69183a23539040e7a9e41634' },
    })

    if (!campaign) {
      console.log('Campaign not found')
      return
    }

    console.log('Current subject:', campaign.subject)
    
    // Fix the typo
    const fixedSubject = campaign.subject.replace(/\{\{BussinessName\}\}/gi, '{{BusinessName}}')
    
    if (fixedSubject !== campaign.subject) {
      await prisma.campaign.update({
        where: { id: campaign.id },
        data: { subject: fixedSubject },
      })
      console.log('✅ Fixed subject:', fixedSubject)
    } else {
      console.log('✅ Subject is already correct')
    }
  } catch (error: any) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixCampaignSubject()

