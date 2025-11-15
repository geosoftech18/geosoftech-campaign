'use client'

import { memo, useState, useEffect } from 'react'
import { EmailTemplateData } from '@/lib/emailTemplate'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  generateFollowUp1Email,
  generateFollowUp2Email,
  generateFollowUp3Email,
  generateFollowUp4Email,
  generateReEngagementEmail,
} from '@/lib/followUpTemplates'

interface FollowUpTemplateEditorProps {
  templateData: EmailTemplateData
  followUpType: 'followup1' | 'followup2' | 'followup3' | 'followup4' | 'reengagement'
  subject: string
  body: string
  onSubjectChange: (subject: string) => void
  onBodyChange: (body: string) => void
}

const followUpTitles = {
  followup1: 'Follow-up 1 - Quick Follow-up',
  followup2: 'Follow-up 2 - Example-based',
  followup3: 'Follow-up 3 - Honest Question',
  followup4: 'Follow-up 4 - Last Note',
  reengagement: 'Re-Engagement - Case Study',
}

export const FollowUpTemplateEditor = memo(function FollowUpTemplateEditor({
  templateData,
  followUpType,
  subject,
  body,
  onSubjectChange,
  onBodyChange,
}: FollowUpTemplateEditorProps) {
  // Only generate preview HTML when body is empty (showing template preview)
  // Debounce the preview generation to avoid lag
  const [previewHTML, setPreviewHTML] = useState('')
  
  useEffect(() => {
    if (body) {
      // If body exists, don't generate preview
      setPreviewHTML('')
      return
    }

    // Debounce preview generation
    const timeoutId = setTimeout(() => {
      let html = ''
      switch (followUpType) {
        case 'followup1':
          html = generateFollowUp1Email(templateData, true)
          break
        case 'followup2':
          html = generateFollowUp2Email(templateData, true)
          break
        case 'followup3':
          html = generateFollowUp3Email(templateData, true)
          break
        case 'followup4':
          html = generateFollowUp4Email(templateData, true)
          break
        case 'reengagement':
          html = generateReEngagementEmail(templateData, true)
          break
      }
      setPreviewHTML(html)
    }, 200) // Short debounce for preview

    return () => clearTimeout(timeoutId)
  }, [templateData, followUpType, body])

  // Generate production HTML with placeholders
  const generateProductionHTML = () => {
    switch (followUpType) {
      case 'followup1':
        return generateFollowUp1Email(templateData, false)
      case 'followup2':
        return generateFollowUp2Email(templateData, false)
      case 'followup3':
        return generateFollowUp3Email(templateData, false)
      case 'followup4':
        return generateFollowUp4Email(templateData, false)
      case 'reengagement':
        return generateReEngagementEmail(templateData, false)
      default:
        return ''
    }
  }

  // Update body when template changes
  const handleUseTemplate = () => {
    const generatedHTML = generateProductionHTML()
    onBodyChange(generatedHTML)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{followUpTitles[followUpType]}</CardTitle>
        <CardDescription>
          Uses template design with your sender details. Customize subject and body as needed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Email Subject</Label>
          <Input
            type="text"
            value={subject}
            onChange={(e) => onSubjectChange(e.target.value)}
            placeholder="e.g., Quick follow-up, {{BusinessName}}"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Email Body</Label>
            <button
              type="button"
              onClick={handleUseTemplate}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Use Template
            </button>
          </div>
          <textarea
            value={body}
            onChange={(e) => onBodyChange(e.target.value)}
            placeholder="Email body HTML (or click 'Use Template' to generate)"
            className="w-full min-h-[200px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          />
          <div className="text-xs text-gray-500">
            Preview: {body ? 'Using your custom HTML' : 'Template preview shown below'}
          </div>
        </div>

        <div className="mt-4">
          <Label>Template Preview</Label>
          <div className="bg-white rounded-lg border border-gray-200 p-4 mt-2" style={{ maxHeight: '400px', overflow: 'auto' }}>
            <div dangerouslySetInnerHTML={{ __html: body || previewHTML }} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

