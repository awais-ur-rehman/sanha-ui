import React, { useState, useRef, useEffect } from 'react'
import {
  FiBold,
  FiItalic,
  FiList,
  FiAlignLeft,
  FiAlignCenter,
  FiAlignRight,
  FiAlignJustify
} from 'react-icons/fi'

interface RichTextEditorProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  rows?: number
  descriptions?: {
    description?: string
    urduDescription?: string
    arabicDescription?: string
  }
  onDescriptionsChange?: (descriptions: {
    description?: string
    urduDescription?: string
    arabicDescription?: string
  }) => void
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value = '',
  onChange,
  placeholder = 'Enter description...',
  className = '',
  rows = 7,
  descriptions,
  onDescriptionsChange
}) => {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [activeLanguage, setActiveLanguage] = useState<'en' | 'ur' | 'ar'>('en')

  // Use descriptions prop if provided, otherwise fall back to single value
  const isMultiLanguage = !!descriptions && !!onDescriptionsChange

  const getCurrentContent = () => {
    if (isMultiLanguage) {
      switch (activeLanguage) {
        case 'en':
          return descriptions?.description || ''
        case 'ur':
          return descriptions?.urduDescription || ''
        case 'ar':
          return descriptions?.arabicDescription || ''
      }
    }
    return value
  }

  useEffect(() => {
    if (editorRef.current) {
      const currentContent = getCurrentContent()
      if (editorRef.current.innerHTML !== currentContent) {
        editorRef.current.innerHTML = currentContent
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLanguage, descriptions, value])

  const handleInput = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML

      if (isMultiLanguage && onDescriptionsChange) {
        // Update the active language's description
        const updatedDescriptions = {
          description: descriptions?.description || '',
          urduDescription: descriptions?.urduDescription || '',
          arabicDescription: descriptions?.arabicDescription || '',
        }

        switch (activeLanguage) {
          case 'en':
            updatedDescriptions.description = newContent
            break
          case 'ur':
            updatedDescriptions.urduDescription = newContent
            break
          case 'ar':
            updatedDescriptions.arabicDescription = newContent
            break
        }

        onDescriptionsChange(updatedDescriptions)
      } else if (onChange) {
        onChange(newContent)
      }
    }
  }

  const handleLanguageChange = (lang: 'en' | 'ur' | 'ar') => {
    if (!isMultiLanguage) return

    // Save current content before switching
    if (editorRef.current) {
      const currentContent = editorRef.current.innerHTML
      const updatedDescriptions = {
        description: descriptions?.description || '',
        urduDescription: descriptions?.urduDescription || '',
        arabicDescription: descriptions?.arabicDescription || '',
      }

      switch (activeLanguage) {
        case 'en':
          updatedDescriptions.description = currentContent
          break
        case 'ur':
          updatedDescriptions.urduDescription = currentContent
          break
        case 'ar':
          updatedDescriptions.arabicDescription = currentContent
          break
      }

      onDescriptionsChange(updatedDescriptions)
    }

    setActiveLanguage(lang)
  }

  const execCommand = (command: string, value?: string) => {
    editorRef.current?.focus()
    document.execCommand(command, false, value)
    handleInput()
  }

  const insertBulletList = () => {
    execCommand('insertUnorderedList')
  }

  const formatHeading = (level: number) => {
    execCommand('formatBlock', `h${level}`)
  }

  const formatParagraph = () => {
    execCommand('formatBlock', 'p')
  }

  const ToolbarButton = ({
    onClick,
    icon: Icon,
    title,
    isActive = false
  }: {
    onClick: () => void
    icon: React.ComponentType<any>
    title: string
    isActive?: boolean
  }) => (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onClick()
      }}
      onMouseDown={(e) => e.preventDefault()}
      title={title}
      className={`p-2 rounded hover:bg-gray-100 transition-colors ${isActive ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:text-gray-900'
        }`}
    >
      <Icon size={16} />
    </button>
  )

  return (
    <div className={`border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-[#0c684b] focus-within:border-transparent ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => execCommand('bold')}
              icon={FiBold}
              title="Bold"
            />
            <ToolbarButton
              onClick={() => execCommand('italic')}
              icon={FiItalic}
              title="Italic"
            />
          </div>

          <div className="w-px h-6 bg-gray-300 mx-1"></div>

          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => formatHeading(1)}
              icon={() => <span className="text-xs font-bold">H1</span>}
              title="Heading 1"
            />
            <ToolbarButton
              onClick={() => formatHeading(2)}
              icon={() => <span className="text-xs font-bold">H2</span>}
              title="Heading 2"
            />
            <ToolbarButton
              onClick={() => formatParagraph()}
              icon={() => <span className="text-xs">P</span>}
              title="Paragraph"
            />
          </div>

          <div className="w-px h-6 bg-gray-300 mx-1"></div>

          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={insertBulletList}
              icon={FiList}
              title="Bullet List"
            />
          </div>

          <div className="w-px h-6 bg-gray-300 mx-1"></div>

          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => execCommand('justifyLeft')}
              icon={FiAlignLeft}
              title="Align Left"
            />
            <ToolbarButton
              onClick={() => execCommand('justifyCenter')}
              icon={FiAlignCenter}
              title="Align Center"
            />
            <ToolbarButton
              onClick={() => execCommand('justifyRight')}
              icon={FiAlignRight}
              title="Align Right"
            />
            <ToolbarButton
              onClick={() => execCommand('justifyFull')}
              icon={FiAlignJustify}
              title="Justify"
            />
          </div>
        </div>

        {/* Language Tabs - Only show if multi-language mode */}
        {isMultiLanguage && (
          <div className="flex items-center gap-1">
            <div className="w-px h-6 bg-gray-300 mx-1"></div>
            <button
              type="button"
              onClick={() => handleLanguageChange('en')}
              className={`px-2 py-1 text-xs font-medium rounded transition-colors ${activeLanguage === 'en'
                ? 'bg-[#0c684b] text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
            >
              en
            </button>
            <button
              type="button"
              onClick={() => handleLanguageChange('ur')}
              className={`px-2 py-1 text-xs font-medium rounded transition-colors ${activeLanguage === 'ur'
                ? 'bg-[#0c684b] text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
            >
              ur
            </button>
            <button
              type="button"
              onClick={() => handleLanguageChange('ar')}
              className={`px-2 py-1 text-xs font-medium rounded transition-colors ${activeLanguage === 'ar'
                ? 'bg-[#0c684b] text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
            >
              ar
            </button>
          </div>
        )}
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`p-3 min-h-[${rows * 1.5}rem] focus:outline-none rich-text-editor overflow-y-auto max-h-[550px] ${isFocused ? 'bg-white' : 'bg-white'
          }`}
        style={{ minHeight: `${rows * 1.5}rem` }}
        data-placeholder={isMultiLanguage ? `Enter ${activeLanguage === 'en' ? 'English' : activeLanguage === 'ur' ? 'Urdu' : 'Arabic'} description...` : placeholder}
        suppressContentEditableWarning={true}
      />


    </div>
  )
}

export default RichTextEditor
