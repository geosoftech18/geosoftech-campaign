'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Plus, Trash2, Edit2, X } from 'lucide-react'

interface Group {
  id: string
  name: string
  description?: string | null
  _count?: {
    leads: number
  }
}

export function GroupManager({ onGroupChange }: { onGroupChange?: () => void }) {
  const [groups, setGroups] = useState<Group[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchGroups()
  }, [])

  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/groups')
      const data = await response.json()
      setGroups(data.groups || [])
    } catch (error) {
      console.error('Failed to fetch groups:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    setLoading(true)
    try {
      const url = editingGroup ? `/api/groups/${editingGroup.id}` : '/api/groups'
      const method = editingGroup ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setFormData({ name: '', description: '' })
        setShowForm(false)
        setEditingGroup(null)
        fetchGroups()
        if (onGroupChange) onGroupChange()
      }
    } catch (error) {
      console.error('Failed to save group:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this group? Leads will not be deleted, only the group assignment.')) {
      return
    }

    try {
      const response = await fetch(`/api/groups/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchGroups()
        if (onGroupChange) onGroupChange()
      }
    } catch (error) {
      console.error('Failed to delete group:', error)
    }
  }

  const handleEdit = (group: Group) => {
    setEditingGroup(group)
    setFormData({
      name: group.name,
      description: group.description || '',
    })
    setShowForm(true)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingGroup(null)
    setFormData({ name: '', description: '' })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Lead Groups
            </CardTitle>
            <CardDescription>
              Organize leads into groups for targeted campaigns
            </CardDescription>
          </div>
          {!showForm && (
            <Button onClick={() => setShowForm(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Group
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg space-y-4 bg-gray-50">
            <div className="space-y-2">
              <Label htmlFor="group-name">Group Name *</Label>
              <Input
                id="group-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Enterprise Clients"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="group-description">Description</Label>
              <Textarea
                id="group-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {editingGroup ? 'Update' : 'Create'} Group
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        <div className="space-y-2">
          {groups.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No groups yet. Create your first group to organize leads.
            </div>
          ) : (
            groups.map((group) => (
              <div
                key={group.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div>
                  <div className="font-medium">{group.name}</div>
                  {group.description && (
                    <div className="text-sm text-gray-500">{group.description}</div>
                  )}
                  <div className="text-xs text-gray-400 mt-1">
                    {group._count?.leads || 0} leads
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(group)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(group.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}







