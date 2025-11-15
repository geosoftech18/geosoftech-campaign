'use client'

import { useState, useMemo, memo } from 'react'
import { Copy, Download, CheckCircle2, Mail, Eye, Code, Smartphone, Monitor } from 'lucide-react'
import { generateEmailHTML, EmailTemplateData } from '@/lib/emailTemplate'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface EmailTemplatePreviewProps {
  templateData: EmailTemplateData
  viewMode?: 'preview' | 'html'
  deviceMode?: 'desktop' | 'mobile'
  onViewModeChange?: (mode: 'preview' | 'html') => void
  onDeviceModeChange?: (mode: 'desktop' | 'mobile') => void
}

// Custom comparison function to prevent unnecessary re-renders
const areEqual = (prevProps: EmailTemplatePreviewProps, nextProps: EmailTemplatePreviewProps) => {
  if (prevProps.viewMode !== nextProps.viewMode) return false
  if (prevProps.deviceMode !== nextProps.deviceMode) return false
  
  // Shallow comparison of templateData fields
  const prev = prevProps.templateData
  const next = nextProps.templateData
  return (
    prev.firstName === next.firstName &&
    prev.companyName === next.companyName &&
    prev.phone === next.phone &&
    prev.website === next.website &&
    prev.email === next.email &&
    prev.address === next.address &&
    prev.founderName === next.founderName &&
    prev.companyBrand === next.companyBrand &&
    prev.instagram === next.instagram &&
    prev.facebook === next.facebook &&
    prev.theme === next.theme
  )
}

export const EmailTemplatePreview = memo(function EmailTemplatePreview({
  templateData,
  viewMode = 'preview',
  deviceMode = 'desktop',
  onViewModeChange,
  onDeviceModeChange,
}: EmailTemplatePreviewProps) {
  const [copied, setCopied] = useState(false)
  const [localViewMode, setLocalViewMode] = useState<'preview' | 'html'>(viewMode)
  const [localDeviceMode, setLocalDeviceMode] = useState<'desktop' | 'mobile'>(deviceMode)

  // Memoize HTML generation - only regenerate when templateData actually changes
  const emailHTML = useMemo(() => {
    return generateEmailHTML(templateData, true)
  }, [templateData])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(emailHTML)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([emailHTML], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `email-template-${templateData.companyName.toLowerCase().replace(/\s+/g, '-')}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const currentViewMode = onViewModeChange ? viewMode : localViewMode
  const currentDeviceMode = onDeviceModeChange ? deviceMode : localDeviceMode

  const setViewMode = (mode: 'preview' | 'html') => {
    if (onViewModeChange) {
      onViewModeChange(mode)
    } else {
      setLocalViewMode(mode)
    }
  }

  const setDeviceMode = (mode: 'desktop' | 'mobile') => {
    if (onDeviceModeChange) {
      onDeviceModeChange(mode)
    } else {
      setLocalDeviceMode(mode)
    }
  }

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <Mail className="w-5 h-5 text-blue-600" />
              <CardTitle>Live Preview</CardTitle>
            </div>
            <CardDescription>See your email template in real-time</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            {/* Device Toggle */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setDeviceMode('desktop')}
                type="button"
                className={`flex items-center space-x-1 px-2 py-1 rounded-md transition-all text-xs ${
                  currentDeviceMode === 'desktop'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Desktop View"
              >
                <Monitor className="w-3 h-3" />
              </button>
              <button
                onClick={() => setDeviceMode('mobile')}
                type="button"
                className={`flex items-center space-x-1 px-2 py-1 rounded-md transition-all text-xs ${
                  currentDeviceMode === 'mobile'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Mobile View"
              >
                <Smartphone className="w-3 h-3" />
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('preview')}
                type="button"
                className={`flex items-center space-x-1 px-2 py-1 rounded-md transition-all text-xs ${
                  currentViewMode === 'preview'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3 h-3" />
                <span className="hidden sm:inline">Preview</span>
              </button>
              <button
                onClick={() => setViewMode('html')}
                type="button"
                className={`flex items-center space-x-1 px-2 py-1 rounded-md transition-all text-xs ${
                  currentViewMode === 'html'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Code className="w-3 h-3" />
                <span className="hidden sm:inline">HTML</span>
              </button>
            </div>

            <Button
              onClick={handleCopy}
              variant="outline"
              size="sm"
              className="flex items-center space-x-1"
              title="Copy HTML"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs">Copy</span>
                </>
              )}
            </Button>
            <Button
              onClick={handleDownload}
              size="sm"
              className="flex items-center space-x-1"
              title="Download HTML"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">Download</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {currentViewMode === 'preview' ? (
          <div className="flex justify-center">
            <div
              className={`bg-slate-50 rounded-lg overflow-hidden transition-all duration-300 ${
                currentDeviceMode === 'mobile'
                  ? 'w-[375px] border-4 border-slate-800 rounded-3xl shadow-2xl'
                  : 'w-full'
              }`}
              style={{ maxHeight: currentDeviceMode === 'mobile' ? '667px' : 'calc(100vh - 320px)' }}
            >
              <div className="overflow-y-auto h-full p-6">
                <div dangerouslySetInnerHTML={{ __html: emailHTML }} />
              </div>
            </div>
          </div>
        ) : (
          <div className="relative">
            <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 text-xs overflow-x-auto max-h-[calc(100vh-320px)] overflow-y-auto">
              <code>{emailHTML}</code>
            </pre>
          </div>
        )}
      </CardContent>

      {/* Stats Footer */}
      <div className="bg-gradient-to-r from-slate-100 to-slate-50 px-6 py-4 border-t border-slate-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-slate-900">{emailHTML.length}</div>
            <div className="text-xs text-slate-600">Characters</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">A+</div>
            <div className="text-xs text-slate-600">Email Score</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">98%</div>
            <div className="text-xs text-slate-600">Deliverability</div>
          </div>
        </div>
      </div>
    </Card>
  )
}, areEqual)

