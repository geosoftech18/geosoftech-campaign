'use client'

import { useState } from 'react'
import { CSVUploader } from '@/components/CSVUploader'
import { LeadTable } from '@/components/LeadTable'

export default function LeadsPage() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleUploadComplete = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Leads Management</h1>
        <p className="text-gray-600">Upload and manage your leads</p>
      </div>
      <CSVUploader onUploadComplete={handleUploadComplete} />
      <LeadTable key={refreshKey} />
    </div>
  )
}


