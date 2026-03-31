"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  List,
  ListOrdered,
} from "lucide-react"
import { useEffect } from "react"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  rows?: number
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null
  }

  const toggleBtnClass = 
    "h-8 w-8 p-0 text-muted-foreground hover:text-foreground data-[active=true]:bg-accent/20 data-[active=true]:text-accent"

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-border/60 bg-muted/20 p-1">
      <Button type="button" variant="ghost" className={toggleBtnClass} data-active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} aria-label="Bold">
        <Bold className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" className={toggleBtnClass} data-active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} aria-label="Italic">
        <Italic className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" className={toggleBtnClass} data-active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()} aria-label="Strikethrough">
        <Strikethrough className="h-4 w-4" />
      </Button>
      <div className="h-4 w-px bg-border/60 mx-1" />
      <Button type="button" variant="ghost" className={toggleBtnClass} data-active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} aria-label="Heading 1">
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" className={toggleBtnClass} data-active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} aria-label="Heading 2">
        <Heading2 className="h-4 w-4" />
      </Button>
      <div className="h-4 w-px bg-border/60 mx-1" />
      <Button type="button" variant="ghost" className={toggleBtnClass} data-active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} aria-label="Bullet list">
        <List className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" className={toggleBtnClass} data-active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} aria-label="Numbered list">
        <ListOrdered className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Start taking notes...",
  className,
  rows = 4
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
        emptyEditorClass:
          "cursor-text before:content-[attr(data-placeholder)] before:text-muted-foreground/60 before:absolute before:-z-10",
      }),
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "prose prose-sm dark:prose-invert max-w-none focus:outline-none p-3",
        style: `min-height: ${rows * 1.5}rem`,
      },
    },
    onUpdate: ({ editor }) => {
      // If the editor is completely empty, it might return <p></p>. Let's keep it simple.
      onChange(editor.isEmpty ? "" : editor.getHTML())
    },
  })

  // Ensure controlled component behavior works for initialization or external clears
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [value, editor])

  return (
    <div className={cn("rounded-md border border-input bg-card shadow-sm overflow-hidden focus-within:ring-1 focus-within:ring-ring", className)}>
      <MenuBar editor={editor} />
      <div className="min-h-[100px] cursor-text" onClick={() => editor?.chain().focus().run()}>
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
