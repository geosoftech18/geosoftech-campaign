'use client'

import { useRef, useEffect, memo } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface EditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export const Editor = memo(function Editor({ value, onChange, placeholder }: EditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [value])

  return (
    <div className="space-y-2">
      <Label>Email Body (HTML supported)</Label>
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Enter your email body...'}
        className="min-h-[300px] font-mono text-sm"
      />
      <div className="text-xs text-gray-500">
        Use variables: {'{{BusinessName}}'}, {'{{City}}'}, {'{{State}}'}, {'{{Category}}'}
      </div>
    </div>
  )
})


