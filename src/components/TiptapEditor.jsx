// src/components/TiptapEditor.jsx
// Tiptap WYSIWYG — PC/모바일 자동 감지 반응형 툴바
// 설치: npm install @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-placeholder @tiptap/extension-underline @tiptap/extension-text-align @tiptap/extension-link

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import { uploadImage } from "@/lib/cloudinary";
import { useState, useCallback, useEffect } from "react";

// ── 모바일 감지 훅
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
}

// ── 툴바 버튼
function ToolBtn({ onClick, active, disabled, title, children }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} title={title}
      style={{ ...tb.btn, ...(active ? tb.btnActive : {}), ...(disabled ? tb.btnDisabled : {}) }}>
      {children}
    </button>
  );
}

function Divider() {
  return <div style={tb.divider} />;
}

export default function TiptapEditor({ value, onChange, placeholder = "내용을 입력하세요..." }) {
  const [imgUploading, setImgUploading] = useState(false);
  const isMobile = useIsMobile();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Underline,
      Image.configure({ inline: false, allowBase64: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // ── 이미지 업로드
  const handleImageUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    if (file.size > 5 * 1024 * 1024) { alert("5MB 이하 이미지만 가능합니다."); return; }
    setImgUploading(true);
    try {
      const url = await uploadImage(file);
      editor.chain().focus().setImage({ src: url, alt: file.name }).run();
    } catch {
      alert("이미지 업로드 실패. 다시 시도해주세요.");
    } finally {
      setImgUploading(false);
      e.target.value = "";
    }
  }, [editor]);

  // ── 링크 삽입
  const setLink = useCallback(() => {
    const url = window.prompt("링크 URL을 입력하세요:", "https://");
    if (!url || !editor) return;
    if (url === "") { editor.chain().focus().extendMarkRange("link").unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  // ── 이미지 업로드 버튼 (공통)
  const ImageUploadBtn = (
    <label style={{ ...tb.btn, cursor: "pointer", position: "relative" }} title="이미지 삽입">
      {imgUploading ? "⏳" : "🖼"}
      <input type="file" accept="image/*" onChange={handleImageUpload}
        style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%" }} />
    </label>
  );

  return (
    <div style={s.wrap}>
      {/* ── PC 툴바 (전체) */}
      {!isMobile && (
        <div style={s.toolbar}>
          <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="굵게"><b>B</b></ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="기울임"><i>I</i></ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="밑줄"><u>U</u></ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="취소선"><s>S</s></ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} title="인라인 코드">{"<>"}</ToolBtn>
          <Divider />
          <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="제목1">H1</ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="제목2">H2</ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="제목3">H3</ToolBtn>
          <Divider />
          <ToolBtn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="왼쪽">◀</ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="가운데">▶◀</ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="오른쪽">▶</ToolBtn>
          <Divider />
          <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="글머리">• 목록</ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="번호">1. 목록</ToolBtn>
          <Divider />
          <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="인용">❝</ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="코드블록">{"{ }"}</ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="구분선">—</ToolBtn>
          <Divider />
          <ToolBtn onClick={setLink} active={editor.isActive("link")} title="링크">🔗</ToolBtn>
          {ImageUploadBtn}
          <Divider />
          <ToolBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="취소">↩</ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="다시실행">↪</ToolBtn>
        </div>
      )}

      {/* ── 모바일 툴바 (핵심만) */}
      {isMobile && (
        <div style={s.toolbarMobile}>
          {/* 1행: 텍스트 서식 */}
          <div style={s.mobileRow}>
            <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="굵게"><b>B</b></ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="기울임"><i>I</i></ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="밑줄"><u>U</u></ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="취소선"><s>S</s></ToolBtn>
            <Divider />
            <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="제목">H2</ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="소제목">H3</ToolBtn>
            <Divider />
            <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="목록">•</ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="인용">❝</ToolBtn>
            <Divider />
            <ToolBtn onClick={setLink} active={editor.isActive("link")} title="링크">🔗</ToolBtn>
            {ImageUploadBtn}
            <Divider />
            <ToolBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="취소">↩</ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="다시실행">↪</ToolBtn>
          </div>
        </div>
      )}

      {/* ── 에디터 본문 */}
      <EditorContent editor={editor} style={s.editorContent} />

      {imgUploading && (
        <div style={s.uploadOverlay}>이미지 업로드 중...</div>
      )}
    </div>
  );
}

const tb = {
  btn: {
    padding: "6px 8px", borderRadius: 5, border: "1.5px solid transparent",
    background: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
    color: "#475569", lineHeight: 1, minWidth: 30, textAlign: "center",
    transition: "all .12s", touchAction: "manipulation",
  },
  btnActive: { background: "#e0e7ff", color: "#4338ca", borderColor: "#c7d2fe" },
  btnDisabled: { opacity: 0.35, cursor: "not-allowed" },
  divider: { width: 1, height: 20, background: "#e2e8f0", margin: "0 2px", alignSelf: "center", flexShrink: 0 },
};

const s = {
  wrap: { border: "1.5px solid #e2e8f0", borderRadius: 8, background: "#fff", overflow: "hidden", marginBottom: 10, position: "relative" },
  toolbar: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2, padding: "8px 10px", borderBottom: "1.5px solid #e2e8f0", background: "#f8fafc" },
  toolbarMobile: { borderBottom: "1.5px solid #e2e8f0", background: "#f8fafc", padding: "6px 8px" },
  mobileRow: { display: "flex", alignItems: "center", gap: 1, overflowX: "auto", WebkitOverflowScrolling: "touch", scrollbarWidth: "none" },
  editorContent: { minHeight: 180, padding: "12px 14px", fontSize: 14, lineHeight: 1.8, color: "#1e293b", outline: "none" },
  uploadOverlay: { position: "absolute", inset: 0, background: "rgba(255,255,255,0.85)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600, color: "#6366f1" },
};
