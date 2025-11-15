'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Save, CheckCircle, Info } from 'lucide-react'

export default function SMTPPage() {
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [formData, setFormData] = useState({
    provider: 'smtp' as 'smtp' | 'gmail-smtp' | 'gmail-api',
    host: '',
    port: '587',
    secure: false,
    user: '',
    password: '',
    fromEmail: '',
    fromName: '',
    // Gmail API fields
    clientId: '',
    clientSecret: '',
    refreshToken: '',
  })

  useEffect(() => {
    fetchSMTPSettings()
  }, [])

  const fetchSMTPSettings = async () => {
    try {
      const response = await fetch('/api/settings/smtp')
      if (response.ok) {
        const data = await response.json()
        if (data.settings) {
          setFormData({
            provider: (data.settings.provider as 'smtp' | 'gmail-smtp' | 'gmail-api') || 'smtp',
            host: data.settings.host || '',
            port: data.settings.port?.toString() || '587',
            secure: data.settings.secure || false,
            user: data.settings.smtpUser || '',
            password: '', // Don't show password
            fromEmail: data.settings.fromEmail || '',
            fromName: data.settings.fromName || '',
            clientId: data.settings.clientId || '',
            clientSecret: '', // Don't show secret
            refreshToken: data.settings.refreshToken || '',
          })
        }
      }
    } catch (error) {
      console.error('Failed to fetch SMTP settings:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSaved(false)

    try {
      const response = await fetch('/api/settings/smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          port: parseInt(formData.port),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        alert(data.error || 'Failed to save SMTP settings')
      }
    } catch (error) {
      alert('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const isGmailSMTP = formData.provider === 'gmail-smtp'
  const isGmailAPI = formData.provider === 'gmail-api'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Email Settings</h1>
        <p className="text-gray-600">Configure your email service provider</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Email Provider Configuration</CardTitle>
          <CardDescription>
            Choose your email service provider. Google Workspace (Gmail) is recommended for better deliverability.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Provider Selection */}
            <div className="space-y-2">
              <Label htmlFor="provider">Email Provider *</Label>
              <Select
                value={formData.provider}
                onValueChange={(value: 'smtp' | 'gmail-smtp' | 'gmail-api') =>
                  setFormData({ ...formData, provider: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="smtp">Generic SMTP Server</SelectItem>
                  <SelectItem value="gmail-smtp">Google Workspace / Gmail (SMTP with App Password)</SelectItem>
                  <SelectItem value="gmail-api">Google Workspace / Gmail (API with OAuth2) - Recommended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Gmail API Info */}
            {isGmailAPI && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">Gmail API Setup Required:</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></li>
                      <li>Create a project and enable Gmail API</li>
                      <li>Create OAuth2 credentials (Client ID & Secret)</li>
                      <li>Use <a href="https://developers.google.com/oauthplayground" target="_blank" rel="noopener noreferrer" className="underline">OAuth Playground</a> to get refresh token</li>
                      <li>Scopes needed: <code className="bg-blue-100 px-1 rounded">https://www.googleapis.com/auth/gmail.send</code></li>
                    </ol>
                  </div>
                </div>
              </div>
            )}

            {/* Gmail SMTP Info */}
            {isGmailSMTP && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-semibold mb-1">Gmail App Password Required:</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Enable 2-Step Verification on your Google account</li>
                      <li>Go to <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="underline">App Passwords</a></li>
                      <li>Generate an app password for "Mail"</li>
                      <li>Use that 16-character password (not your regular password)</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}

            {/* SMTP Host & Port (only for generic SMTP) */}
            {!isGmailSMTP && !isGmailAPI && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="host">SMTP Host *</Label>
                  <Input
                    id="host"
                    value={formData.host}
                    onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                    placeholder="smtp.example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="port">SMTP Port *</Label>
                  <Input
                    id="port"
                    type="number"
                    value={formData.port}
                    onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                    placeholder="587"
                    required
                  />
                </div>
              </div>
            )}

            {/* SSL/TLS (only for generic SMTP) */}
            {!isGmailSMTP && !isGmailAPI && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="secure"
                    checked={formData.secure}
                    onChange={(e) => setFormData({ ...formData, secure: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="secure">Use SSL/TLS (usually for port 465)</Label>
                </div>
              </div>
            )}

            {/* Email/Username */}
            <div className="space-y-2">
              <Label htmlFor="user">
                {isGmailAPI ? 'Gmail/Google Workspace Email *' : 'SMTP Username/Email *'}
              </Label>
              <Input
                id="user"
                type="email"
                value={formData.user}
                onChange={(e) => setFormData({ ...formData, user: e.target.value })}
                placeholder={isGmailAPI || isGmailSMTP ? "your-email@gmail.com" : "your-email@example.com"}
                required
              />
            </div>

            {/* Password/App Password (for SMTP and Gmail SMTP) */}
            {(formData.provider === 'smtp' || isGmailSMTP) && (
              <div className="space-y-2">
                <Label htmlFor="password">
                  {isGmailSMTP ? 'Gmail App Password *' : 'SMTP Password *'}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={isGmailSMTP ? "16-character app password" : "Your SMTP password"}
                  required
                />
              </div>
            )}

            {/* Gmail API OAuth2 Fields */}
            {isGmailAPI && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="clientId">OAuth2 Client ID *</Label>
                  <Input
                    id="clientId"
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    placeholder="xxxxx.apps.googleusercontent.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientSecret">OAuth2 Client Secret *</Label>
                  <Input
                    id="clientSecret"
                    type="password"
                    value={formData.clientSecret}
                    onChange={(e) => setFormData({ ...formData, clientSecret: e.target.value })}
                    placeholder="GOCSPX-xxxxx"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="refreshToken">OAuth2 Refresh Token *</Label>
                  <Input
                    id="refreshToken"
                    type="password"
                    value={formData.refreshToken}
                    onChange={(e) => setFormData({ ...formData, refreshToken: e.target.value })}
                    placeholder="1//xxxxx"
                    required
                  />
                </div>
              </>
            )}

            {/* From Email & Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fromEmail">From Email *</Label>
                <Input
                  id="fromEmail"
                  type="email"
                  value={formData.fromEmail}
                  onChange={(e) => setFormData({ ...formData, fromEmail: e.target.value })}
                  placeholder="noreply@yourdomain.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fromName">From Name</Label>
                <Input
                  id="fromName"
                  value={formData.fromName}
                  onChange={(e) => setFormData({ ...formData, fromName: e.target.value })}
                  placeholder="Your Company Name"
                />
              </div>
            </div>

            {saved && (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-md">
                <CheckCircle className="h-5 w-5" />
                <span>Email settings saved successfully!</span>
              </div>
            )}

            <Button type="submit" disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
