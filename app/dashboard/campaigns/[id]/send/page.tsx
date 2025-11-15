'use client'

import { useState, useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Send, Loader2, CheckCircle, XCircle } from 'lucide-react'

export default function SendCampaignPage() {
  const router = useRouter()
  const params = useParams()
  const campaignId = params.id as string
  const [loading, setLoading] = useState(false)
  const [previewLoading, setPreviewLoading] = useState(true)
  const [preview, setPreview] = useState<{
    totalLeads: number
    availableLeads: number
    emailsSentToday: number
    dailyLimit: number
    remainingQuota: number
    willSend: number
  } | null>(null)
  const [result, setResult] = useState<{
    success: boolean
    message?: string
    sent?: number
    failed?: number
    total?: number
    dailyStats?: {
      emailsSentToday: number
      dailyLimit: number
      remainingQuota: number
    }
    note?: string
    emailsSentToday?: number
    dailyLimit?: number
  } | null>(null)

  useEffect(() => {
    // Fetch preview data
    const fetchPreview = async () => {
      try {
        const response = await fetch(`/api/campaigns/${campaignId}/send/preview`)
        if (response.ok) {
          const data = await response.json()
          setPreview(data)
        }
      } catch (error) {
        console.error('Failed to fetch preview:', error)
      } finally {
        setPreviewLoading(false)
      }
    }
    fetchPreview()
  }, [campaignId])

  const handleSend = async () => {
    if (!confirm('Are you sure you want to send this campaign? This action cannot be undone.')) {
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch(`/api/campaigns/${campaignId}/send`, {
        method: 'POST',
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
          sent: data.sent,
          failed: data.failed,
          total: data.total,
          dailyStats: data.dailyStats,
          note: data.note,
        })
      } else {
        setResult({
          success: false,
          message: data.error || 'Failed to send campaign',
          emailsSentToday: data.emailsSentToday,
          dailyLimit: data.dailyLimit,
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'An error occurred. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Send Campaign</h1>
        <p className="text-gray-600">Send this campaign to all matching leads</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Confirm Campaign Send</CardTitle>
          <CardDescription>
            This will send emails to leads matching your campaign filters. Maximum 700 unique emails per day.
            Emails will be sent in batches of 100 to protect your domain health.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!result && (
            <div className="space-y-4">
              {/* Preview Stats */}
              {previewLoading ? (
                <div className="text-center py-4 text-gray-500">Loading preview...</div>
              ) : preview ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-3">📊 Send Preview</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-blue-600">Total Matching Leads:</p>
                      <p className="font-semibold text-blue-900 text-lg">{preview.totalLeads.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-blue-600">Available to Send:</p>
                      <p className="font-semibold text-blue-900 text-lg">{preview.availableLeads.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-blue-600">Will Send (Limited):</p>
                      <p className="font-semibold text-blue-900 text-lg">{preview.willSend.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-blue-600">Daily Limit Status:</p>
                      <p className="font-semibold text-blue-900 text-lg">
                        {preview.emailsSentToday.toLocaleString()} / {preview.dailyLimit.toLocaleString()}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        {preview.remainingQuota > 0 ? (
                          <span>⏳ {preview.remainingQuota.toLocaleString()} remaining today</span>
                        ) : (
                          <span className="text-red-600">⚠️ Daily limit reached</span>
                        )}
                      </p>
                    </div>
                  </div>
                  {preview.totalLeads > preview.availableLeads && (
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <p className="text-xs text-blue-700">
                        ℹ️ {preview.totalLeads - preview.availableLeads} leads already received an email today and will be skipped
                      </p>
                    </div>
                  )}
                  {preview.availableLeads > preview.willSend && (
                    <div className="mt-2">
                      <p className="text-xs text-blue-700">
                        ℹ️ {preview.availableLeads - preview.willSend} leads will be queued for tomorrow (daily limit reached)
                      </p>
                    </div>
                  )}
                </div>
              ) : null}

              {preview && preview.remainingQuota <= 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-800 mb-1">Daily Limit Reached</h3>
                    <p className="text-sm text-red-700">
                      You've already sent {preview.emailsSentToday.toLocaleString()} emails today (limit: {preview.dailyLimit.toLocaleString()}). 
                      Please try again tomorrow or wait for the limit to reset.
                    </p>
                  </div>
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">Before you send:</h3>
                <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                  <li>Make sure your SMTP settings are configured correctly</li>
                  <li>Test with a small campaign first</li>
                  <li>Emails will be sent in batches with delays between batches</li>
                  <li>Daily limit: Maximum 700 unique emails per day</li>
                  <li>You can track progress in the Analytics page</li>
                </ul>
              </div>
              <Button 
                onClick={handleSend} 
                disabled={loading || (preview && preview.remainingQuota <= 0)} 
                size="lg" 
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Campaign...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Campaign Now
                  </>
                )}
              </Button>
            </div>
          )}

          {result && (
            <div
              className={`p-4 rounded-lg ${
                result.success
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              <div className="flex items-start gap-3">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <h3
                    className={`font-semibold mb-2 ${
                      result.success ? 'text-green-800' : 'text-red-800'
                    }`}
                  >
                    {result.success ? 'Campaign Sent Successfully!' : 'Campaign Send Failed'}
                  </h3>
                  <p
                    className={`text-sm mb-2 ${
                      result.success ? 'text-green-700' : 'text-red-700'
                    }`}
                  >
                    {result.message}
                  </p>
                  {result.success && result.sent !== undefined && (
                    <div className="text-sm text-green-700 space-y-1">
                      <p>✅ Sent: {result.sent.toLocaleString()}</p>
                      {result.failed !== undefined && result.failed > 0 && (
                        <p>❌ Failed: {result.failed.toLocaleString()}</p>
                      )}
                      {result.total !== undefined && (
                        <p>📊 Total: {result.total.toLocaleString()}</p>
                      )}
                      {result.dailyStats && (
                        <div className="mt-3 pt-3 border-t border-green-200">
                          <p className="font-semibold">Daily Email Limit:</p>
                          <p>📧 Sent Today: {result.dailyStats.emailsSentToday.toLocaleString()} / {result.dailyStats.dailyLimit.toLocaleString()}</p>
                          <p>⏳ Remaining: {result.dailyStats.remainingQuota.toLocaleString()} emails</p>
                        </div>
                      )}
                      {result.note && (
                        <div className="mt-2 pt-2 border-t border-green-200">
                          <p className="text-xs text-green-600">ℹ️ {result.note}</p>
                        </div>
                      )}
                    </div>
                  )}
                  {!result.success && result.emailsSentToday !== undefined && (
                    <div className="text-sm text-red-700 space-y-1 mt-2">
                      <p>📧 Emails sent today: {result.emailsSentToday.toLocaleString()} / {result.dailyLimit?.toLocaleString()}</p>
                      <p className="text-xs">Daily limit of {result.dailyLimit?.toLocaleString()} emails reached. Try again tomorrow.</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard/campaigns')}
                  className="flex-1"
                >
                  Back to Campaigns
                </Button>
                <Button
                  onClick={() => router.push('/dashboard/analytics')}
                  className="flex-1"
                >
                  View Analytics
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

