import { prisma } from '@/lib/prisma'
import { StatsCard } from '@/components/StatsCard'
import { Chart } from '@/components/Chart'
import { Mail, CheckCircle, XCircle, MousePointerClick, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function AnalyticsPage() {

  const [
    totalSent,
    totalOpened,
    totalClicked,
    totalFailed,
    emailLogs,
    campaignStats,
  ] = await Promise.all([
    prisma.emailLog.count({ where: { status: 'sent' } }),
    prisma.emailLog.count({ where: { status: 'opened' } }),
    prisma.emailLog.count({ where: { status: 'clicked' } }),
    prisma.emailLog.count({ where: { status: 'failed' } }),
    prisma.emailLog.findMany({
      where: { sentAt: { not: null } },
      select: { sentAt: true, status: true },
      orderBy: { sentAt: 'desc' },
      take: 100,
    }),
    prisma.campaign.findMany({
      include: {
        _count: {
          select: {
            emailLogs: true,
          },
        },
      },
    }),
  ])

  // Calculate rates
  const openRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(2) : '0.00'
  const clickRate = totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(2) : '0.00'

  // Prepare chart data - emails sent per day
  const dailyData = emailLogs.reduce((acc: any, log) => {
    if (!log.sentAt) return acc
    const date = new Date(log.sentAt).toLocaleDateString()
    if (!acc[date]) {
      acc[date] = { name: date, sent: 0, opened: 0, clicked: 0 }
    }
    acc[date].sent++
    if (log.status === 'opened' || log.status === 'clicked') {
      acc[date].opened++
    }
    if (log.status === 'clicked') {
      acc[date].clicked++
    }
    return acc
  }, {})

  const chartData = Object.values(dailyData).reverse().slice(-30)

  // Campaign performance data
  const campaignData = campaignStats.map((campaign) => ({
    name: campaign.name.length > 15 ? campaign.name.substring(0, 15) + '...' : campaign.name,
    emails: campaign._count.emailLogs,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Analytics</h1>
        <p className="text-gray-600">Track your email campaign performance</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatsCard
          title="Total Sent"
          value={totalSent.toLocaleString()}
          icon={Mail}
          color="text-blue-600"
        />
        <StatsCard
          title="Opened"
          value={totalOpened.toLocaleString()}
          icon={Eye}
          color="text-green-600"
        />
        <StatsCard
          title="Clicked"
          value={totalClicked.toLocaleString()}
          icon={MousePointerClick}
          color="text-purple-600"
        />
        <StatsCard
          title="Open Rate"
          value={`${openRate}%`}
          icon={CheckCircle}
          color="text-indigo-600"
          description={`${totalOpened} of ${totalSent} emails`}
        />
        <StatsCard
          title="Click Rate"
          value={`${clickRate}%`}
          icon={CheckCircle}
          color="text-teal-600"
          description={`${totalClicked} of ${totalSent} emails`}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Email Activity (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <Chart
                data={chartData}
                type="line"
                dataKey="sent"
                name="Emails Sent"
              />
            ) : (
              <div className="text-center py-8 text-gray-500">
                No data available yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Campaign Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {campaignData.length > 0 ? (
              <Chart
                data={campaignData}
                type="bar"
                dataKey="emails"
                name="Emails Sent"
              />
            ) : (
              <div className="text-center py-8 text-gray-500">
                No campaigns yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Failed Emails</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-600" />
            <span className="text-2xl font-bold">{totalFailed.toLocaleString()}</span>
            <span className="text-gray-600">
              emails failed to send out of {totalSent.toLocaleString()} total
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

