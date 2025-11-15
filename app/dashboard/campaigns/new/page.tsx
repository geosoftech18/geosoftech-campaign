import { prisma } from '@/lib/prisma'
import { CampaignForm } from '@/components/CampaignForm'

export default async function NewCampaignPage() {

  // Get unique values for filters
  const [cities, states, categories] = await Promise.all([
    prisma.lead.findMany({ select: { city: true }, distinct: ['city'] }),
    prisma.lead.findMany({ select: { state: true }, distinct: ['state'] }),
    prisma.lead.findMany({ select: { category: true }, distinct: ['category'] }),
  ])

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Create New Campaign</h1>
      <CampaignForm
        cities={cities.map((c) => c.city).filter(Boolean) as string[]}
        states={states.map((s) => s.state).filter(Boolean) as string[]}
        categories={categories.map((c) => c.category).filter(Boolean) as string[]}
      />
    </div>
  )
}

