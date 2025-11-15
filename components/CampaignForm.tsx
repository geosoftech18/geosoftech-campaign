'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Editor } from './Editor'
import { EmailTemplateEditor } from './EmailTemplateEditor'
import { EmailTemplatePreview } from './EmailTemplatePreview'
import { FollowUpTemplateEditor } from './FollowUpTemplateEditor'
import { generateEmailHTML, EmailTemplateData } from '@/lib/emailTemplate'
import { ChevronDown, ChevronUp } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface CampaignFormProps {
  campaignId?: string
  initialData?: {
    name: string
    subject: string
    body: string
    segmentCity?: string | null
    segmentState?: string | null
    segmentCategory?: string | null
    followUp1Days?: number | null
    followUp2Days?: number | null
    followUp3Days?: number | null
    followUp4Days?: number | null
    reEngagementDays?: number | null
    followUp1Subject?: string | null
    followUp1Body?: string | null
    followUp2Subject?: string | null
    followUp2Body?: string | null
    followUp3Subject?: string | null
    followUp3Body?: string | null
    followUp4Subject?: string | null
    followUp4Body?: string | null
    reEngagementSubject?: string | null
    reEngagementBody?: string | null
  }
  cities?: string[]
  states?: string[]
  categories?: string[]
}

export function CampaignForm({
  campaignId,
  initialData,
  cities = [],
  states = [],
  categories = [],
}: CampaignFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [useTemplate, setUseTemplate] = useState(false)
  const [viewMode, setViewMode] = useState<'preview' | 'html'>('preview')
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop')
  
  // FAQ-style collapse states for follow-ups
  const [expandedFollowUps, setExpandedFollowUps] = useState<Record<string, boolean>>({
    followup1: false,
    followup2: false,
    followup3: false,
    followup4: false,
    reengagement: false,
  })

  const toggleFollowUp = (key: string) => {
    setExpandedFollowUps((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }
  
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    subject: initialData?.subject || '',
    body: initialData?.body || '',
    segmentCity: initialData?.segmentCity || '',
    segmentState: initialData?.segmentState || '',
    segmentCategory: initialData?.segmentCategory || '',
    followUp1Days: initialData?.followUp1Days || 3,
    followUp2Days: initialData?.followUp2Days || 7,
    followUp3Days: initialData?.followUp3Days || 10,
    followUp4Days: initialData?.followUp4Days || 14,
    reEngagementDays: initialData?.reEngagementDays || 30,
    followUp1Subject: initialData?.followUp1Subject || '',
    followUp1Body: initialData?.followUp1Body || '',
    followUp2Subject: initialData?.followUp2Subject || '',
    followUp2Body: initialData?.followUp2Body || '',
    followUp3Subject: initialData?.followUp3Subject || '',
    followUp3Body: initialData?.followUp3Body || '',
    followUp4Subject: initialData?.followUp4Subject || '',
    followUp4Body: initialData?.followUp4Body || '',
    reEngagementSubject: initialData?.reEngagementSubject || '',
    reEngagementBody: initialData?.reEngagementBody || '',
  })

  const [templateData, setTemplateData] = useState<EmailTemplateData>({
    firstName: 'John',
    companyName: 'TechCorp',
    phone: '+91 777-60-85112',
    website: 'www.geosoftech.com',
    email: 'info@geosoftech.com',
    address: 'Behind Laxmi Dariyamahal Bus Stop, Nepensea Road Mumbai, Grant Road-400007',
    founderName: 'Amar Korde',
    companyBrand: 'GEO Softech',
    instagram: '@geosoftech',
    facebook: 'geosoftech',
    linkedin: 'geo-softech',
    theme: 'blue',
  })

  // Debounced template generation - only update body after user stops typing
  // Reduced to 300ms for better responsiveness
  useEffect(() => {
    if (!useTemplate) return

    const timeoutId = setTimeout(() => {
      const generatedHTML = generateEmailHTML(templateData, false)
      setFormData((prev) => ({ ...prev, body: generatedHTML }))
    }, 300) // Wait 300ms after user stops typing

    return () => clearTimeout(timeoutId)
  }, [templateData, useTemplate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = campaignId
        ? `/api/campaigns/${campaignId}`
        : '/api/campaigns/create'
      const method = campaignId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          segmentCity: formData.segmentCity || null,
          segmentState: formData.segmentState || null,
          segmentCategory: formData.segmentCategory || null,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push('/dashboard/campaigns')
        router.refresh()
      } else {
        alert(data.error || 'Failed to save campaign')
      }
    } catch (error) {
      alert('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
          <CardDescription>Create a new email campaign</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Campaign Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Email Subject *</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
              placeholder="e.g., Welcome {{BusinessName}}!"
              required
            />
          </div>
          
          {/* Email Editor Toggle */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Email Body</Label>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setUseTemplate(false)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    !useTemplate
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  Simple Editor
                </button>
                <button
                  type="button"
                  onClick={() => setUseTemplate(true)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    useTemplate
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  Template Builder
                </button>
              </div>
            </div>

            {useTemplate ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <EmailTemplateEditor
                    templateData={templateData}
                    onChange={setTemplateData}
                  />
                </div>
                <div>
                  <EmailTemplatePreview
                    templateData={templateData}
                    viewMode={viewMode}
                    deviceMode={deviceMode}
                    onViewModeChange={setViewMode}
                    onDeviceModeChange={setDeviceMode}
                  />
                </div>
              </div>
            ) : (
              <Editor
                value={formData.body}
                onChange={(value) => setFormData((prev) => ({ ...prev, body: value }))}
                placeholder="<p>Hello {{BusinessName}},</p><p>We hope this email finds you well...</p>"
              />
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Segment Filters (Optional)</CardTitle>
          <CardDescription>Target specific leads by location or category</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>City</Label>
              <Select
                value={formData.segmentCity || 'all'}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, segmentCity: value === 'all' ? '' : value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>State</Label>
              <Select
                value={formData.segmentState || 'all'}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, segmentState: value === 'all' ? '' : value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All States" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  {states.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={formData.segmentCategory || 'all'}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, segmentCategory: value === 'all' ? '' : value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Follow-up Emails (Optional)</CardTitle>
          <CardDescription>Schedule automatic follow-up emails with professional templates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Follow-up 1 */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => toggleFollowUp('followup1')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {expandedFollowUps.followup1 ? (
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  )}
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">Follow-up 1 - Quick Follow-up</h3>
                  <p className="text-sm text-gray-500">
                    Days After: {formData.followUp1Days} {formData.followUp1Subject && formData.followUp1Body ? '• Configured' : '• Not configured'}
                  </p>
                </div>
              </div>
            </button>
            {expandedFollowUps.followup1 && (
              <div className="p-4 space-y-4 border-t border-gray-200">
                <div className="space-y-2">
                  <Label>Follow-up 1 - Days After</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.followUp1Days}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, followUp1Days: parseInt(e.target.value) || 3 }))
                    }
                  />
                </div>
                <FollowUpTemplateEditor
                  templateData={templateData}
                  followUpType="followup1"
                  subject={formData.followUp1Subject}
                  body={formData.followUp1Body}
                  onSubjectChange={(value) => setFormData((prev) => ({ ...prev, followUp1Subject: value }))}
                  onBodyChange={(value) => setFormData((prev) => ({ ...prev, followUp1Body: value }))}
                />
              </div>
            )}
          </div>

          {/* Follow-up 2 */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => toggleFollowUp('followup2')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {expandedFollowUps.followup2 ? (
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  )}
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">Follow-up 2 - Example-based</h3>
                  <p className="text-sm text-gray-500">
                    Days After: {formData.followUp2Days} {formData.followUp2Subject && formData.followUp2Body ? '• Configured' : '• Not configured'}
                  </p>
                </div>
              </div>
            </button>
            {expandedFollowUps.followup2 && (
              <div className="p-4 space-y-4 border-t border-gray-200">
                <div className="space-y-2">
                  <Label>Follow-up 2 - Days After</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.followUp2Days}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, followUp2Days: parseInt(e.target.value) || 7 }))
                    }
                  />
                </div>
                <FollowUpTemplateEditor
                  templateData={templateData}
                  followUpType="followup2"
                  subject={formData.followUp2Subject}
                  body={formData.followUp2Body}
                  onSubjectChange={(value) => setFormData((prev) => ({ ...prev, followUp2Subject: value }))}
                  onBodyChange={(value) => setFormData((prev) => ({ ...prev, followUp2Body: value }))}
                />
              </div>
            )}
          </div>

          {/* Follow-up 3 */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => toggleFollowUp('followup3')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {expandedFollowUps.followup3 ? (
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  )}
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">Follow-up 3 - Honest Question</h3>
                  <p className="text-sm text-gray-500">
                    Days After: {formData.followUp3Days} {formData.followUp3Subject && formData.followUp3Body ? '• Configured' : '• Not configured'}
                  </p>
                </div>
              </div>
            </button>
            {expandedFollowUps.followup3 && (
              <div className="p-4 space-y-4 border-t border-gray-200">
                <div className="space-y-2">
                  <Label>Follow-up 3 - Days After</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.followUp3Days}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, followUp3Days: parseInt(e.target.value) || 10 }))
                    }
                  />
                </div>
                <FollowUpTemplateEditor
                  templateData={templateData}
                  followUpType="followup3"
                  subject={formData.followUp3Subject}
                  body={formData.followUp3Body}
                  onSubjectChange={(value) => setFormData((prev) => ({ ...prev, followUp3Subject: value }))}
                  onBodyChange={(value) => setFormData((prev) => ({ ...prev, followUp3Body: value }))}
                />
              </div>
            )}
          </div>

          {/* Follow-up 4 */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => toggleFollowUp('followup4')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {expandedFollowUps.followup4 ? (
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  )}
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">Follow-up 4 - Last Note</h3>
                  <p className="text-sm text-gray-500">
                    Days After: {formData.followUp4Days} {formData.followUp4Subject && formData.followUp4Body ? '• Configured' : '• Not configured'}
                  </p>
                </div>
              </div>
            </button>
            {expandedFollowUps.followup4 && (
              <div className="p-4 space-y-4 border-t border-gray-200">
                <div className="space-y-2">
                  <Label>Follow-up 4 - Days After</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.followUp4Days}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, followUp4Days: parseInt(e.target.value) || 14 }))
                    }
                  />
                </div>
                <FollowUpTemplateEditor
                  templateData={templateData}
                  followUpType="followup4"
                  subject={formData.followUp4Subject}
                  body={formData.followUp4Body}
                  onSubjectChange={(value) => setFormData((prev) => ({ ...prev, followUp4Subject: value }))}
                  onBodyChange={(value) => setFormData((prev) => ({ ...prev, followUp4Body: value }))}
                />
              </div>
            )}
          </div>

          {/* Re-Engagement */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => toggleFollowUp('reengagement')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {expandedFollowUps.reengagement ? (
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  )}
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">Re-Engagement - Case Study</h3>
                  <p className="text-sm text-gray-500">
                    Days After: {formData.reEngagementDays} {formData.reEngagementSubject && formData.reEngagementBody ? '• Configured' : '• Not configured'}
                  </p>
                </div>
              </div>
            </button>
            {expandedFollowUps.reengagement && (
              <div className="p-4 space-y-4 border-t border-gray-200">
                <div className="space-y-2">
                  <Label>Re-Engagement - Days After</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.reEngagementDays}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, reEngagementDays: parseInt(e.target.value) || 30 }))
                    }
                  />
                </div>
                <FollowUpTemplateEditor
                  templateData={templateData}
                  followUpType="reengagement"
                  subject={formData.reEngagementSubject}
                  body={formData.reEngagementBody}
                  onSubjectChange={(value) => setFormData((prev) => ({ ...prev, reEngagementSubject: value }))}
                  onBodyChange={(value) => setFormData((prev) => ({ ...prev, reEngagementBody: value }))}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/dashboard/campaigns')}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : campaignId ? 'Update Campaign' : 'Create Campaign'}
        </Button>
      </div>
    </form>
  )
}


