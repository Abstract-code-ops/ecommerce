'use client'

import React, { useRef } from 'react'
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Heading3 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DescriptionEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export default function DescriptionEditor({ 
  value, 
  onChange, 
  placeholder = "Enter product description...",
  className 
}: DescriptionEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const insertAtCursor = (before: string, after: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end)
    onChange(newText)
    
    // Restore cursor position after the inserted text
    setTimeout(() => {
      textarea.focus()
      const newPosition = start + before.length + selectedText.length + after.length
      textarea.setSelectionRange(
        start + before.length, 
        start + before.length + selectedText.length
      )
    }, 0)
  }

  const insertLine = (prefix: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    
    // Find the start of the current line
    let lineStart = start
    while (lineStart > 0 && value[lineStart - 1] !== '\n') {
      lineStart--
    }
    
    const newText = value.substring(0, lineStart) + prefix + value.substring(lineStart)
    onChange(newText)
    
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + prefix.length, start + prefix.length)
    }, 0)
  }

  const tools = [
    {
      icon: Heading1,
      label: 'Heading 1',
      action: () => insertLine('# '),
    },
    {
      icon: Heading2,
      label: 'Heading 2', 
      action: () => insertLine('## '),
    },
    {
      icon: Heading3,
      label: 'Heading 3',
      action: () => insertLine('### '),
    },
    {
      icon: Bold,
      label: 'Bold',
      action: () => insertAtCursor('**', '**'),
    },
    {
      icon: Italic,
      label: 'Italic',
      action: () => insertAtCursor('*', '*'),
    },
    {
      icon: List,
      label: 'Bullet List',
      action: () => insertLine('- '),
    },
    {
      icon: ListOrdered,
      label: 'Numbered List',
      action: () => insertLine('1. '),
    },
  ]

  return (
    <div className={cn("space-y-2", className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-1.5 border border-input rounded-md bg-muted/30">
        {tools.map((tool, index) => (
          <React.Fragment key={tool.label}>
            {index === 3 && <div className="w-px h-5 bg-border mx-1" />}
            {index === 5 && <div className="w-px h-5 bg-border mx-1" />}
            <button
              type="button"
              onClick={tool.action}
              className="p-1.5 rounded hover:bg-muted transition-colors"
              title={tool.label}
            >
              <tool.icon className="w-4 h-4 text-muted-foreground" />
            </button>
          </React.Fragment>
        ))}
        <div className="flex-1" />
        <span className="text-[10px] text-muted-foreground px-2">
          Markdown supported
        </span>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        className="w-full min-h-[180px] px-3 py-2 rounded-md border border-input bg-background text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring font-mono"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />

      {/* Formatting Help */}
      <div className="text-[10px] text-muted-foreground space-y-0.5">
        <p><strong>Tips:</strong> Use # for headings, **bold**, *italic*, - for bullets, 1. for numbered lists</p>
        <p>Double newline creates a new paragraph. Single newline creates a line break.</p>
      </div>
    </div>
  )
}
