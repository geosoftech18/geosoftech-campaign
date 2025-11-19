'use client'

import { useState, useEffect } from 'react'
import { CSVUploader } from '@/components/CSVUploader'
import { ManualLeadForm } from '@/components/ManualLeadForm'
import { GroupManager } from '@/components/GroupManager'
import { LeadTable } from '@/components/LeadTable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload, UserPlus, Users, Table } from 'lucide-react'

interface Group {
  id: string
  name: string
  _count?: {
    leads: number
  }
}

export default function LeadsPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [groups, setGroups] = useState<Group[]>([])

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

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
    fetchGroups()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Leads Management</h1>
        <p className="text-gray-600">Upload, create, and organize your leads into groups</p>
      </div>

      <Tabs defaultValue="add" className="space-y-4">
        <TabsList>
          <TabsTrigger value="add" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload CSV
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Add Manually
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Groups
          </TabsTrigger>
          <TabsTrigger value="leads" className="flex items-center gap-2">
            <Table className="h-4 w-4" />
            All Leads
          </TabsTrigger>
        </TabsList>

        <TabsContent value="add" className="space-y-4">
          <CSVUploader onUploadComplete={handleRefresh} />
        </TabsContent>

        <TabsContent value="manual" className="space-y-4">
          <ManualLeadForm groups={groups} onSuccess={handleRefresh} />
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
          <GroupManager onGroupChange={handleRefresh} />
        </TabsContent>

        <TabsContent value="leads" className="space-y-4">
          <LeadTable key={refreshKey} />
        </TabsContent>
      </Tabs>
    </div>
  )
}


