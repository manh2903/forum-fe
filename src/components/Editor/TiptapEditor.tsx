import { useEffect, useRef, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import { Box, IconButton, Tooltip, Divider } from '@mui/material'
import {
  FormatBold, FormatItalic, FormatUnderlined, FormatStrikethrough,
  FormatListBulleted, FormatListNumbered, FormatQuote, Code,
  Title, FormatAlignLeft, FormatAlignCenter, FormatAlignRight, FormatAlignJustify,
  Undo, Redo, FormatClear, InsertLink, LinkOff, Image as ImageIcon
} from '@mui/icons-material'
import api from '../../services/api'
import toast from 'react-hot-toast'

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null
  }

  const Btn = ({ onClick, isActive, disabled, children, title }: any) => (
    <Tooltip title={title}>
      <span>
        <IconButton
          size="small"
          onClick={onClick}
          disabled={disabled}
          sx={{
            color: isActive ? 'primary.main' : 'text.secondary',
            bgcolor: isActive ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
            borderRadius: 1,
            '&:hover': {
              color: 'primary.main',
              bgcolor: 'rgba(79, 70, 229, 0.05)',
            }
          }}
        >
          {children}
        </IconButton>
      </span>
    </Tooltip>
  )

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL liên kết:', previousUrl || '')
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  const addImage = useCallback(() => {
    const url = window.prompt('URL của hình ảnh:')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  return (
    <Box sx={{
      display: 'flex', flexWrap: 'wrap', gap: 0.5, p: 1,
      borderBottom: '1px solid #e2e8f0', bgcolor: '#f8fafc'
    }}>
      <Btn title="Bold" onClick={() => editor.chain().focus().toggleBold().run()} disabled={!editor.can().chain().focus().toggleBold().run()} isActive={editor.isActive('bold')}>
        <FormatBold fontSize="small" />
      </Btn>
      <Btn title="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} disabled={!editor.can().chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')}>
        <FormatItalic fontSize="small" />
      </Btn>
      <Btn title="Underline" onClick={() => editor.chain().focus().toggleUnderline().run()} disabled={!editor.can().chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')}>
        <FormatUnderlined fontSize="small" />
      </Btn>
      <Btn title="Strikethrough" onClick={() => editor.chain().focus().toggleStrike().run()} disabled={!editor.can().chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')}>
        <FormatStrikethrough fontSize="small" />
      </Btn>
      
      <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.5 }} />
      
      <Btn title="Heading 1" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })}>
        <Title fontSize="small" />
        <span style={{ fontSize: '0.7em', fontWeight: 'bold' }}>1</span>
      </Btn>
      <Btn title="Heading 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })}>
        <Title fontSize="small" />
        <span style={{ fontSize: '0.7em', fontWeight: 'bold' }}>2</span>
      </Btn>
      <Btn title="Heading 3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })}>
        <Title fontSize="small" />
        <span style={{ fontSize: '0.7em', fontWeight: 'bold' }}>3</span>
      </Btn>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.5 }} />

      <Btn title="Bullet List" onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')}>
        <FormatListBulleted fontSize="small" />
      </Btn>
      <Btn title="Numbered List" onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')}>
        <FormatListNumbered fontSize="small" />
      </Btn>
      
      <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.5 }} />

      <Btn title="Blockquote" onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')}>
        <FormatQuote fontSize="small" />
      </Btn>
      <Btn title="Code Block" onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive('codeBlock')}>
        <Code fontSize="small" />
      </Btn>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.5 }} />

      <Btn title="Align Left" onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })}>
        <FormatAlignLeft fontSize="small" />
      </Btn>
      <Btn title="Align Center" onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })}>
        <FormatAlignCenter fontSize="small" />
      </Btn>
      <Btn title="Align Right" onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })}>
        <FormatAlignRight fontSize="small" />
      </Btn>
      <Btn title="Justify" onClick={() => editor.chain().focus().setTextAlign('justify').run()} isActive={editor.isActive({ textAlign: 'justify' })}>
        <FormatAlignJustify fontSize="small" />
      </Btn>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.5 }} />

      <Btn title="Link" onClick={setLink} isActive={editor.isActive('link')}>
        <InsertLink fontSize="small" />
      </Btn>
      <Btn title="Remove Link" onClick={() => editor.chain().focus().unsetLink().run()} disabled={!editor.isActive('link')}>
        <LinkOff fontSize="small" />
      </Btn>
      <Btn title="Image URL" onClick={addImage}>
        <ImageIcon fontSize="small" />
      </Btn>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.5 }} />

      <Btn title="Clear Format" onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}>
        <FormatClear fontSize="small" />
      </Btn>
      <Btn title="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().chain().focus().undo().run()}>
        <Undo fontSize="small" />
      </Btn>
      <Btn title="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().chain().focus().redo().run()}>
        <Redo fontSize="small" />
      </Btn>
    </Box>
  )
}

export default function TiptapEditor({ 
  value, 
  onChange, 
  minHeight = '400px',
  placeholder = '',
  hideMenu = false
}: { 
  value: string, 
  onChange: (val: string) => void,
  minHeight?: string,
  placeholder?: string,
  hideMenu?: boolean
}) {
  const isUpdatingRef = useRef(false)
  const isSettingContentRef = useRef(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({
        placeholder: placeholder || 'Viết nội dung...',
      })
    ],
    content: value || '<p></p>',
    onUpdate: ({ editor }) => {
      if (isSettingContentRef.current) return
      isUpdatingRef.current = true
      onChange(editor.getHTML())
      setTimeout(() => { isUpdatingRef.current = false }, 10)
    },
    editorProps: {
      attributes: {
        class: 'markdown-body tiptap-editor-content',
        style: `min-height: ${minHeight}; padding: 20px; outline: none;`
      },
      handleDrop: function(view, event, _slice, moved) {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0]
          if (file.type.startsWith('image/')) {
            uploadImage(file, view)
            return true
          }
        }
        return false
      },
      handlePaste: function(view, event, _slice) {
        if (event.clipboardData && event.clipboardData.files && event.clipboardData.files[0]) {
          const file = event.clipboardData.files[0]
          if (file.type.startsWith('image/')) {
            uploadImage(file, view)
            return true
          }
        }
        return false
      }
    }
  })

  const uploadImage = async (file: File, view: any) => {
    try {
      const formData = new FormData()
      formData.append('image', file)
      
      const res = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      // Assuming res.data.url contains the uploaded image URL
      const url = res.data.url
      if (url) {
        // Insert the image at the current cursor position
        const { schema } = view.state
        const node = schema.nodes.image.create({ src: url })
        const transaction = view.state.tr.replaceSelectionWith(node)
        view.dispatch(transaction)
      } else {
        toast.error('Upload ảnh thất bại (không có URL)')
      }
    } catch (err: any) {
      console.error(err)
      toast.error('Có lỗi khi upload ảnh.')
    }
  }

  useEffect(() => {
    if (editor && value && !isUpdatingRef.current && editor.getHTML() !== value) {
      isSettingContentRef.current = true
      editor.commands.setContent(value)
      isSettingContentRef.current = false
    }
  }, [value, editor])

  if (!editor) return null

  return (
    <Box sx={{ 
      border: 'none', borderRadius: 0, overflow: 'hidden',
      '& .tiptap p.is-editor-empty:first-of-type::before': {
        color: '#94a3b8',
        content: 'attr(data-placeholder)',
        float: 'left',
        height: 0,
        pointerEvents: 'none',
      }
    }}>
      {!hideMenu && <MenuBar editor={editor} />}
      <EditorContent editor={editor} />
    </Box>
  )
}
