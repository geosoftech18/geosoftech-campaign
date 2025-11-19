'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UserPlus, CheckCircle, XCircle } from 'lucide-react'

interface Group {
  id: string
  name: string
  _count?: {
    leads: number
  }
}

interface ManualLeadFormProps {
  groups: Group[]
  onSuccess?: () => void
}

export function ManualLeadForm({ groups, onSuccess }: ManualLeadFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    email: '',
    telephone: '',
    websiteURL: '',
    linkedin: '',
    address: '',
    category: '',
    city: '',
    state: '',
    groupId: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.businessName || !formData.email) {
      setResult({ success: false, message: 'Business name and email are required' })
      return
    }

    setSubmitting(true)
    setResult(null)

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          groupId: formData.groupId && formData.groupId.trim() ? formData.groupId : null,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult({ success: true, message: 'Lead added successfully!' })
        setFormData({
          name: '',
          businessName: '',
          email: '',
          telephone: '',
          websiteURL: '',
          linkedin: '',
          address: '',
          category: '',
          city: '',
          state: '',
          groupId: '',
        })
        if (onSuccess) {
          onSuccess()
        }
      } else {
        setResult({ success: false, message: data.error || 'Failed to add lead' })
      }
    } catch (error) {
      setResult({ success: false, message: 'An error occurred' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Add Lead Manually
        </CardTitle>
        <CardDescription>
          Fill in the lead information below. Name and Business Name are required.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Contact name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                placeholder="Company name"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telephone">Telephone</Label>
              <Input
                id="telephone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="websiteURL">Website URL</Label>
              <Input
                id="websiteURL"
                type="url"
                placeholder="https://example.com"
                value={formData.websiteURL}
                onChange={(e) => setFormData({ ...formData, websiteURL: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                type="url"
                placeholder="https://linkedin.com/company/example"
                value={formData.linkedin}
                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="New York"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                placeholder="NY"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="Technology"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="groupId">Add to Group</Label>
              <Select
                value={formData.groupId || undefined}
                onValueChange={(value) => setFormData({ ...formData, groupId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a group (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name} ({group._count?.leads || 0} leads)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              placeholder="Street address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={2}
            />
          </div>

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? 'Adding...' : 'Add Lead'}
          </Button>

          {result && (
            <div
              className={`flex items-center gap-2 p-3 rounded-md ${
                result.success
                  ? 'bg-green-50 text-green-800'
                  : 'bg-red-50 text-red-800'
              }`}
            >
              {result.success ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
              <span>{result.message}</span>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}


