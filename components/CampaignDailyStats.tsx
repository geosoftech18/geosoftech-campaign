'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, CheckCircle, XCircle, MousePointerClick, Eye, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DailyCampaignStats {
  date: string
  campaignId: string
  campaignName: string
  sent: number
  opened: number
  clicked: number
  failed: number
}

interface CampaignDailyStatsProps {
  data: DailyCampaignStats[]
}

const statusOptions = [
  { id: 'sent', label: 'Sent', icon: Mail, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
  { id: 'opened', label: 'Opened', icon: Eye, color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
  { id: 'clicked', label: 'Clicked', icon: MousePointerClick, color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
  { id: 'failed', label: 'Failed', icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
]

export function CampaignDailyStats({ data }: CampaignDailyStatsProps) {
  const router = useRouter()
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['sent', 'opened', 'clicked', 'failed'])

  const toggleStatus = (statusId: string) => {
    setSelectedStatuses(prev =>
      prev.includes(statusId)
        ? prev.filter(id => id !== statusId)
        : [...prev, statusId]
    )
  }

  // Group data by date and campaign
  const groupedData = useMemo(() => {
    const grouped: Record<string, Record<string, DailyCampaignStats>> = {}
    
    data.forEach(item => {
      if (!grouped[item.date]) {
        grouped[item.date] = {}
      }
      if (!grouped[item.date][item.campaignId]) {
        grouped[item.date][item.campaignId] = {
          date: item.date,
          campaignId: item.campaignId,
          campaignName: item.campaignName,
          sent: 0,
          opened: 0,
          clicked: 0,
          failed: 0,
        }
      }
      const entry = grouped[item.date][item.campaignId]
      entry.sent += item.sent
      entry.opened += item.opened
      entry.clicked += item.clicked
      entry.failed += item.failed
    })

    return grouped
  }, [data])

  // Sort dates in descending order (most recent first)
  const sortedDates = useMemo(() => {
    return Object.keys(groupedData).sort((a, b) => {
      return new Date(b).getTime() - new Date(a).getTime()
    })
  }, [groupedData])

  // Calculate totals for each status
  const totals = useMemo(() => {
    return data.reduce(
      (acc, item) => ({
        sent: acc.sent + item.sent,
        opened: acc.opened + item.opened,
        clicked: acc.clicked + item.clicked,
        failed: acc.failed + item.failed,
      }),
      { sent: 0, opened: 0, clicked: 0, failed: 0 }
    )
  }, [data])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Daily Campaign Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Filter Checkboxes */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-700 mb-2">Filter by Status:</div>
          <div className="flex flex-wrap gap-3">
            {statusOptions.map(option => {
              const isSelected = selectedStatuses.includes(option.id)
              const Icon = option.icon
              const count = totals[option.id as keyof typeof totals]
              
              return (
                <button
                  key={option.id}
                  onClick={() => toggleStatus(option.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all',
                    'hover:shadow-md hover:scale-105',
                    isSelected
                      ? `${option.bgColor} ${option.borderColor} border-2`
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                  />
                  <Icon className={cn('h-4 w-4', option.color)} />
                  <span className={cn('font-medium', isSelected ? option.color : 'text-gray-700')}>
                    {option.label}
                  </span>
                  <span className={cn(
                    'px-2 py-0.5 rounded-full text-xs font-semibold',
                    isSelected ? 'bg-white/80' : 'bg-gray-100'
                  )}>
                    {count.toLocaleString()}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Daily Campaign Statistics Table */}
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Campaign
                  </th>
                  {selectedStatuses.includes('sent') && (
                    <th className="px-4 py-3 text-center text-xs font-semibold text-blue-700 uppercase tracking-wider">
                      <div className="flex items-center justify-center gap-1">
                        <Mail className="h-4 w-4" />
                        Sent
                      </div>
                    </th>
                  )}
                  {selectedStatuses.includes('opened') && (
                    <th className="px-4 py-3 text-center text-xs font-semibold text-green-700 uppercase tracking-wider">
                      <div className="flex items-center justify-center gap-1">
                        <Eye className="h-4 w-4" />
                        Opened
                      </div>
                    </th>
                  )}
                  {selectedStatuses.includes('clicked') && (
                    <th className="px-4 py-3 text-center text-xs font-semibold text-purple-700 uppercase tracking-wider">
                      <div className="flex items-center justify-center gap-1">
                        <MousePointerClick className="h-4 w-4" />
                        Clicked
                      </div>
                    </th>
                  )}
                  {selectedStatuses.includes('failed') && (
                    <th className="px-4 py-3 text-center text-xs font-semibold text-red-700 uppercase tracking-wider">
                      <div className="flex items-center justify-center gap-1">
                        <XCircle className="h-4 w-4" />
                        Failed
                      </div>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedDates.length === 0 ? (
                  <tr>
                    <td
                      colSpan={2 + selectedStatuses.length}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      No data available
                    </td>
                  </tr>
                ) : (
                  sortedDates.flatMap(date => {
                    const campaigns = Object.values(groupedData[date])
                    // Filter campaigns that have data for selected statuses
                    const visibleCampaigns = campaigns.filter(campaign => {
                      if (selectedStatuses.length === 0) return true
                      return selectedStatuses.some(status => {
                        const value = campaign[status as keyof DailyCampaignStats] as number
                        return value > 0
                      })
                    })

                    if (visibleCampaigns.length === 0) return []

                    return visibleCampaigns.map((campaign, idx) => (
                      <tr
                        key={`${date}-${campaign.campaignId}-${idx}`}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => {
                          router.push(`/dashboard/analytics/${date}/${campaign.campaignId}`)
                        }}
                      >
                        {idx === 0 && (
                          <td
                            rowSpan={visibleCampaigns.length}
                            className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 align-top"
                          >
                            <div className="flex flex-col">
                              <span>{new Date(date).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })}</span>
                              <span className="text-xs text-gray-500 mt-1">
                                {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                              </span>
                            </div>
                          </td>
                        )}
                          <td className="px-4 py-3 text-sm text-gray-900">
                            <div className="font-medium">{campaign.campaignName}</div>
                          </td>
                          {selectedStatuses.includes('sent') && (
                            <td className="px-4 py-3 text-center">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {campaign.sent.toLocaleString()}
                              </span>
                            </td>
                          )}
                          {selectedStatuses.includes('opened') && (
                            <td className="px-4 py-3 text-center">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {campaign.opened.toLocaleString()}
                              </span>
                            </td>
                          )}
                          {selectedStatuses.includes('clicked') && (
                            <td className="px-4 py-3 text-center">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                {campaign.clicked.toLocaleString()}
                              </span>
                            </td>
                          )}
                          {selectedStatuses.includes('failed') && (
                            <td className="px-4 py-3 text-center">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                {campaign.failed.toLocaleString()}
                              </span>
                            </td>
                          )}
                        </tr>
                      ))
                    })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Footer */}
        {selectedStatuses.length > 0 && (
          <div className="flex flex-wrap gap-4 pt-4 border-t">
            <div className="text-sm text-gray-600">
              <span className="font-semibold">Total Records:</span>{' '}
              <span className="text-gray-900">{sortedDates.length} days</span>
            </div>
            {selectedStatuses.map(status => {
              const option = statusOptions.find(opt => opt.id === status)
              const total = totals[status as keyof typeof totals]
              if (!option) return null
              return (
                <div key={status} className="flex items-center gap-1.5 text-sm">
                  <option.icon className={cn('h-4 w-4', option.color)} />
                  <span className="text-gray-600">{option.label}:</span>
                  <span className={cn('font-semibold', option.color)}>
                    {total.toLocaleString()}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

