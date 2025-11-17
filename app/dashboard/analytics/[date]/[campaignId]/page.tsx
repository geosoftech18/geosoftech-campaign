import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Mail, Eye, MousePointerClick, XCircle, CheckCircle, Clock } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const ITEMS_PER_PAGE = 50

interface PageProps {
  params: Promise<{
    date: string
    campaignId: string
  }>
  searchParams: Promise<{
    page?: string
  }>
}

function getStatusBadge(status: string) {
  const statusConfig = {
    sent: { label: 'Sent', color: 'bg-blue-100 text-blue-800', icon: Mail },
    opened: { label: 'Opened', color: 'bg-green-100 text-green-800', icon: Eye },
    clicked: { label: 'Clicked', color: 'bg-purple-100 text-purple-800', icon: MousePointerClick },
    failed: { label: 'Failed', color: 'bg-red-100 text-red-800', icon: XCircle },
    pending: { label: 'Pending', color: 'bg-gray-100 text-gray-800', icon: Clock },
  }

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
  const Icon = config.icon

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  )
}

function formatDateTime(date: Date | null | undefined): string {
  if (!date) return '-'
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function CampaignDetailPage({ params, searchParams }: PageProps) {
  const { date, campaignId } = await params
  const { page } = await searchParams
  const currentPage = parseInt(page || '1', 10)

  try {
    // Parse date (format: YYYY-MM-DD)
    const startDate = new Date(date)
    startDate.setHours(0, 0, 0, 0)
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 1)

    // Fetch campaign info
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { name: true },
    })

    if (!campaign) {
      return (
        <div className="space-y-6">
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-red-600">
                <p className="text-lg font-semibold">Campaign not found</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    // Fetch email logs for this date and campaign
    const whereClause = {
      campaignId,
      sentAt: {
        gte: startDate,
        lt: endDate,
      },
    }

    const [emailLogs, totalCount, statusCounts] = await Promise.all([
      prisma.emailLog.findMany({
        where: whereClause,
        include: {
          lead: {
            select: {
              businessName: true,
              email: true,
              city: true,
              state: true,
            },
          },
        },
        orderBy: { sentAt: 'desc' },
        skip: (currentPage - 1) * ITEMS_PER_PAGE,
        take: ITEMS_PER_PAGE,
      }),
      prisma.emailLog.count({ where: whereClause }),
      prisma.emailLog.groupBy({
        by: ['status'],
        where: whereClause,
        _count: true,
      }),
    ])

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

    // Calculate statistics from grouped counts
    const statusMap = statusCounts.reduce((acc, item) => {
      acc[item.status] = item._count
      return acc
    }, {} as Record<string, number>)

    const stats = {
      total: totalCount,
      sent: (statusMap['sent'] || 0) + (statusMap['opened'] || 0) + (statusMap['clicked'] || 0),
      opened: (statusMap['opened'] || 0) + (statusMap['clicked'] || 0),
      clicked: statusMap['clicked'] || 0,
      failed: statusMap['failed'] || 0,
    }

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link href="/dashboard/analytics">
              <Button variant="ghost" className="mb-2">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Analytics
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">{campaign.name}</h1>
            <p className="text-gray-600 mt-1">
              Email logs for {new Date(date).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm font-medium text-gray-600">Total Emails</div>
              <div className="text-2xl font-bold mt-1">{totalCount.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm font-medium text-gray-600">Sent</div>
              <div className="text-2xl font-bold text-blue-600 mt-1">{stats.sent.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm font-medium text-gray-600">Opened</div>
              <div className="text-2xl font-bold text-green-600 mt-1">{stats.opened.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm font-medium text-gray-600">Clicked</div>
              <div className="text-2xl font-bold text-purple-600 mt-1">{stats.clicked.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm font-medium text-gray-600">Failed</div>
              <div className="text-2xl font-bold text-red-600 mt-1">{stats.failed.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Email Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Email Logs ({totalCount.toLocaleString()} total)</CardTitle>
          </CardHeader>
          <CardContent>
            {emailLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No emails found for this date
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Business Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Location
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Sent At
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Opened At
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Clicked At
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Error
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {emailLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {log.lead.businessName || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            <a
                              href={`mailto:${log.lead.email}`}
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              {log.lead.email}
                            </a>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {[log.lead.city, log.lead.state].filter(Boolean).join(', ') || '-'}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {getStatusBadge(log.status)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {formatDateTime(log.sentAt)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {formatDateTime(log.openedAt)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {formatDateTime(log.clickedAt)}
                          </td>
                          <td className="px-4 py-3 text-sm text-red-600 max-w-xs truncate" title={log.errorMessage || ''}>
                            {log.errorMessage || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <div className="text-sm text-gray-700">
                      Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                      {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount} results
                    </div>
                    <div className="flex gap-2">
                      {currentPage > 1 && (
                        <Link
                          href={`/dashboard/analytics/${date}/${campaignId}?page=${currentPage - 1}`}
                          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                        >
                          Previous
                        </Link>
                      )}
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum: number
                        if (totalPages <= 5) {
                          pageNum = i + 1
                        } else if (currentPage <= 3) {
                          pageNum = i + 1
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i
                        } else {
                          pageNum = currentPage - 2 + i
                        }

                        return (
                          <Link
                            key={pageNum}
                            href={`/dashboard/analytics/${date}/${campaignId}?page=${pageNum}`}
                            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 px-3 ${
                              currentPage === pageNum
                                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
                            }`}
                          >
                            {pageNum}
                          </Link>
                        )
                      })}
                      {currentPage < totalPages && (
                        <Link
                          href={`/dashboard/analytics/${date}/${campaignId}?page=${currentPage + 1}`}
                          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                        >
                          Next
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    )
  } catch (error: any) {
    console.error('Error loading campaign details:', error)
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-red-600">
              <p className="text-lg font-semibold">Error loading email logs</p>
              <p className="text-sm text-gray-600 mt-2">{error?.message || 'Unknown error'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
}

