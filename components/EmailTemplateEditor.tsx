'use client'

import { memo } from 'react'
import { Settings, User, Building2, Phone, Globe, Palette, Mail as MailIcon, MapPin, Instagram, Facebook } from 'lucide-react'
import { EmailTemplateData } from '@/lib/emailTemplate'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface EmailTemplateEditorProps {
  templateData: EmailTemplateData
  onChange: (data: EmailTemplateData) => void
}

const themes = [
  { value: 'blue' as const, name: 'Ocean Blue', colors: 'from-blue-600 to-blue-700', bg: 'bg-blue-600' },
  { value: 'green' as const, name: 'Forest Green', colors: 'from-green-600 to-green-700', bg: 'bg-green-600' },
  { value: 'purple' as const, name: 'Royal Purple', colors: 'from-purple-600 to-purple-700', bg: 'bg-purple-600' },
  { value: 'orange' as const, name: 'Sunset Orange', colors: 'from-orange-600 to-orange-700', bg: 'bg-orange-600' },
  { value: 'slate' as const, name: 'Professional Slate', colors: 'from-slate-600 to-slate-700', bg: 'bg-slate-600' },
  { value: 'red' as const, name: 'Bold Red', colors: 'from-red-600 to-red-700', bg: 'bg-red-600' },
]

export const EmailTemplateEditor = memo(function EmailTemplateEditor({ templateData, onChange }: EmailTemplateEditorProps) {
  // Optimized handleChange - doesn't depend on templateData to avoid recreating on every keystroke
  const handleChange = (field: keyof EmailTemplateData, value: string) => {
    onChange({ ...templateData, [field]: value })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Settings className="w-5 h-5 text-blue-600" />
          <CardTitle>Email Template Customization</CardTitle>
        </div>
        <CardDescription>Personalize your email template with themes and contact details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Theme Selector */}
        <div className="space-y-4 pb-6 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide flex items-center space-x-2">
            <Palette className="w-4 h-4 text-blue-600" />
            <span>Color Theme</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {themes.map((theme) => (
              <button
                key={theme.value}
                onClick={() => handleChange('theme', theme.value)}
                type="button"
                className={`relative p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                  templateData.theme === theme.value
                    ? 'border-blue-600 bg-blue-50 shadow-md'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className={`h-8 rounded-md bg-gradient-to-r ${theme.colors} mb-2 shadow-sm`}></div>
                <div className="text-sm font-medium text-slate-700">{theme.name}</div>
                {templateData.theme === theme.value && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Recipient Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide flex items-center space-x-2">
            <User className="w-4 h-4 text-blue-600" />
            <span>Recipient Details (Template Variables)</span>
          </h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="firstName">First Name Variable</Label>
              <Input
                id="firstName"
                type="text"
                value={templateData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                placeholder="e.g., John (used as {{FirstName}})"
              />
              <p className="text-xs text-gray-500 mt-1">This will be replaced with {'{{FirstName}}'} in emails</p>
            </div>

            <div>
              <Label htmlFor="companyName" className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-slate-500" />
                <span>Company Name Variable</span>
              </Label>
              <Input
                id="companyName"
                type="text"
                value={templateData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                placeholder="e.g., TechCorp (used as {{BusinessName}})"
              />
              <p className="text-xs text-gray-500 mt-1">This will be replaced with {'{{BusinessName}}'} in emails</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200"></div>

        {/* Sender Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide flex items-center space-x-2">
            <User className="w-4 h-4 text-blue-600" />
            <span>Your Details</span>
          </h3>

          <div className="space-y-4">
            <div>
              <Label htmlFor="founderName">Your Name</Label>
              <Input
                id="founderName"
                type="text"
                value={templateData.founderName}
                onChange={(e) => handleChange('founderName', e.target.value)}
                placeholder="e.g., Amar Korde"
              />
            </div>

            <div>
              <Label htmlFor="companyBrand" className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-slate-500" />
                <span>Your Company</span>
              </Label>
              <Input
                id="companyBrand"
                type="text"
                value={templateData.companyBrand}
                onChange={(e) => handleChange('companyBrand', e.target.value)}
                placeholder="e.g., GEO Softech"
              />
            </div>

            <div>
              <Label htmlFor="phone" className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-slate-500" />
                <span>Phone Number</span>
              </Label>
              <Input
                id="phone"
                type="text"
                value={templateData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="e.g., +1 (555) 123-4567"
              />
            </div>

            <div>
              <Label htmlFor="website" className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-slate-500" />
                <span>Website</span>
              </Label>
              <Input
                id="website"
                type="text"
                value={templateData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="e.g., www.yoursite.com"
              />
            </div>

            <div>
              <Label htmlFor="email" className="flex items-center space-x-2">
                <MailIcon className="w-4 h-4 text-slate-500" />
                <span>Email Address</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={templateData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="e.g., hello@yourcompany.com"
              />
            </div>

            <div>
              <Label htmlFor="address" className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-slate-500" />
                <span>Business Address</span>
              </Label>
              <Input
                id="address"
                type="text"
                value={templateData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="e.g., 123 Business Ave, Suite 100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="instagram" className="flex items-center space-x-2">
                  <Instagram className="w-4 h-4 text-slate-500" />
                  <span>Instagram</span>
                </Label>
                <Input
                  id="instagram"
                  type="text"
                  value={templateData.instagram}
                  onChange={(e) => handleChange('instagram', e.target.value)}
                  placeholder="@username"
                />
              </div>

              <div>
                <Label htmlFor="facebook" className="flex items-center space-x-2">
                  <Facebook className="w-4 h-4 text-slate-500" />
                  <span>Facebook</span>
                </Label>
                <Input
                  id="facebook"
                  type="text"
                  value={templateData.facebook}
                  onChange={(e) => handleChange('facebook', e.target.value)}
                  placeholder="username"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pro Tip Box */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <div className="bg-blue-600 rounded-full p-1 mt-0.5">
              <span className="text-white text-xs">💡</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-900 mb-1">Pro Tips</p>
              <p className="text-sm text-blue-800 leading-relaxed">
                Personalized emails have 26% higher open rates. Choose a theme that matches your brand identity. The recipient details are template variables that will be replaced with actual lead data when sending.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

