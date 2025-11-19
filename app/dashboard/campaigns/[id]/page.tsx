import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CampaignForm } from '@/components/CampaignForm'
import { Mail, Calendar, Users, Edit, Send } from 'lucide-react'

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {

  const { id } = await params
  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      _count: {
        select: { emailLogs: true },
      },
    },
  })

  if (!campaign) {
    redirect('/dashboard/campaigns')
  }

  // Get unique values for filters
  const [cities, states, categories] = await Promise.all([
    prisma.lead.findMany({ select: { city: true }, distinct: ['city'] }),
    prisma.lead.findMany({ select: { state: true }, distinct: ['state'] }),
    prisma.lead.findMany({ select: { category: true }, distinct: ['category'] }),
  ])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">{campaign.name}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Mail className="h-4 w-4" />
              <span>{campaign._count.emailLogs} emails sent</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Created {new Date(campaign.createdAt).toLocaleDateString()}</span>
            </div>
            <span
              className={`px-2 py-1 rounded text-xs ${
                campaign.status === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : campaign.status === 'active'
                  ? 'bg-purple-100 text-purple-800'
                  : campaign.status === 'sending'
                  ? 'bg-blue-100 text-blue-800'
                  : campaign.status === 'paused'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {campaign.status}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {(campaign.status === 'draft' || campaign.status === 'active' || campaign.status === 'completed') && (
            <Link href={`/dashboard/campaigns/${campaign.id}/send`}>
              <Button>
                <Send className="mr-2 h-4 w-4" />
                {campaign.status === 'draft' ? 'Send Campaign' : 'Send Again'}
              </Button>
            </Link>
          )}
          <Link href="/dashboard/campaigns">
            <Button variant="outline">Back to Campaigns</Button>
          </Link>
        </div>
      </div>

      <CampaignForm
        campaignId={campaign.id}
        initialData={{
          name: campaign.name,
          subject: campaign.subject,
          body: campaign.body,
          segmentCity: campaign.segmentCity,
          segmentState: campaign.segmentState,
          segmentCategory: campaign.segmentCategory,
          followUp1Days: campaign.followUp1Days,
          followUp2Days: campaign.followUp2Days,
          followUp1Subject: campaign.followUp1Subject,
          followUp1Body: campaign.followUp1Body,
          followUp2Subject: campaign.followUp2Subject,
          followUp2Body: campaign.followUp2Body,
        }}
        cities={cities.map((c) => c.city).filter(Boolean) as string[]}
        states={states.map((s) => s.state).filter(Boolean) as string[]}
        categories={categories.map((c) => c.category).filter(Boolean) as string[]}
      />
    </div>
  )
}

