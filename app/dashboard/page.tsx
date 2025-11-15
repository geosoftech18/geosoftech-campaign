import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Mail, CheckCircle, XCircle } from 'lucide-react'

export default async function DashboardPage() {

  const [totalLeads, totalCampaigns, emailStats] = await Promise.all([
    prisma.lead.count(),
    prisma.campaign.count(),
    prisma.emailLog.groupBy({
      by: ['status'],
      _count: true,
    }),
  ])

  const sentCount = emailStats.find((s) => s.status === 'sent')?._count || 0
  const failedCount = emailStats.find((s) => s.status === 'failed')?._count || 0
  const openedCount = emailStats.find((s) => s.status === 'opened')?._count || 0

  const stats = [
    {
      title: 'Total Leads',
      value: totalLeads.toLocaleString(),
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Total Campaigns',
      value: totalCampaigns.toLocaleString(),
      icon: Mail,
      color: 'text-green-600',
    },
    {
      title: 'Emails Sent',
      value: sentCount.toLocaleString(),
      icon: CheckCircle,
      color: 'text-purple-600',
    },
    {
      title: 'Failed Emails',
      value: failedCount.toLocaleString(),
      icon: XCircle,
      color: 'text-red-600',
    },
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

