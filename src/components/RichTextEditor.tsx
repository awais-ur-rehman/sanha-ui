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
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value = '',
  onChange,
  placeholder = 'Enter description...',
  className = '',
  rows = 7
}) => {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value
    }
  }, [value])

  const handleInput = () => {
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML)
    }
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
      className={`p-2 rounded hover:bg-gray-100 transition-colors ${
        isActive ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      <Icon size={16} />
    </button>
  )

  return (
    <div className={`border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-[#0c684b] focus-within:border-transparent ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg">
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

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`p-3 min-h-[${rows * 1.5}rem] focus:outline-none rich-text-editor overflow-y-auto max-h-[550px] ${
          isFocused ? 'bg-white' : 'bg-white'
        }`}
        style={{ minHeight: `${rows * 1.5}rem` }}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />
      
    
    </div>
  )
}

export default RichTextEditor
