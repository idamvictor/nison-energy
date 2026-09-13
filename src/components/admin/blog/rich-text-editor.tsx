"use client";

import { useRef, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code2,
  Link2,
  Link2Off,
  ImagePlus,
  Loader2,
  Minus,
  Undo2,
  Redo2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function ToolbarButton({
  onClick,
  active,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        buttonVariants({ variant: "ghost", size: "icon-sm" }),
        active && "bg-muted text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function ImageMenuButton({ editor }: { editor: Editor }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const insertByUrl = () => {
    const url = window.prompt("Image URL", "https://");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/media", { method: "POST", body: formData });
      const data = (await res.json()) as { url?: string; error?: string };
      if (res.ok && data.url) {
        editor.chain().focus().setImage({ src: data.url }).run();
      } else {
        window.alert(data.error ?? "Upload failed.");
      }
    } catch {
      window.alert("Upload failed. Check your connection and try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Insert image"
        disabled={uploading}
        className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
      >
        {uploading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <ImagePlus className="size-4" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={insertByUrl}>Paste link…</DropdownMenuItem>
        <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
          Upload image…
        </DropdownMenuItem>
      </DropdownMenuContent>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        hidden
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </DropdownMenu>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-secondary/40 px-1.5 py-1">
      <ToolbarButton
        label="Bold"
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
      >
        <Bold className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Italic"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
      >
        <Italic className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Strikethrough"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive("strike")}
      >
        <Strikethrough className="size-4" />
      </ToolbarButton>

      <span className="mx-1 h-5 w-px bg-border" />

      <ToolbarButton
        label="Heading 2"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
      >
        <Heading2 className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Heading 3"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive("heading", { level: 3 })}
      >
        <Heading3 className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Bullet list"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
      >
        <List className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Numbered list"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
      >
        <ListOrdered className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Quote"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
      >
        <Quote className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Code block"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        active={editor.isActive("codeBlock")}
      >
        <Code2 className="size-4" />
      </ToolbarButton>

      <span className="mx-1 h-5 w-px bg-border" />

      <ToolbarButton label="Add link" onClick={setLink} active={editor.isActive("link")}>
        <Link2 className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Remove link"
        onClick={() => editor.chain().focus().unsetLink().run()}
        disabled={!editor.isActive("link")}
      >
        <Link2Off className="size-4" />
      </ToolbarButton>
      <ImageMenuButton editor={editor} />
      <ToolbarButton
        label="Horizontal rule"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <Minus className="size-4" />
      </ToolbarButton>

      <span className="mx-1 h-5 w-px bg-border" />

      <ToolbarButton
        label="Undo"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
      >
        <Undo2 className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Redo"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
      >
        <Redo2 className="size-4" />
      </ToolbarButton>
    </div>
  );
}

export function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: { openOnClick: false },
      }),
      Image,
      Placeholder.configure({ placeholder: "Write the article…" }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: "blog-content min-h-[320px] px-4 py-3 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  return (
    <div className="overflow-hidden rounded-lg border border-input bg-background">
      {editor && <Toolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}
