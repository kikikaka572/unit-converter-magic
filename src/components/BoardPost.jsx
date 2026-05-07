// BoardPost.jsx — 공유 URL을 /community/{postId} 로 변경
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export default function BoardPost({ postId, adminPw, onBack }) {
  const [post,        setPost]        = useState(null);
  const [comments,    setComments]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [commentText, setCommentText] = useState("");
  const [authorName,  setAuthorName]  = useState("");
  const [replyTo,     setReplyTo]     = useState(null);
  const [submitting,  setSubmitting]  = useState(false);
  const [toast,       setToast]       = useState("");
  const [editMode,    setEditMode]    = useState(false);
  const [editForm,    setEditForm]    = useState({ title: "", content: "" });
  const [editPwModal, setEditPwModal] = useState(false);
  const [editPwInput, setEditPwInput] = useState("");
  const [editPwError, setEditPwError] = useState("");
  const [deleteModal, setDeleteModal] = useState(null);
  const [pwInput,     setPwInput]     = useState("");
  const [pwError,     setPwError]     = useState("");

  const fetchPost = useCallback(async () => {
    const { data } = await supabase
      .from("posts").select("*, categories(slug, name_ko, icon, color)")
      .eq("id", postId).single();
    if (data) {
      setPost(data);
      await supabase.rpc("increment_view_count", { post_uuid: postId });
    }
  }, [postId]);

  const fetchComments = useCallback(async () => {
    const { data } = await supabase.from("comments").select("*")
      .eq("post_id", postId).eq("is_hidden", false)
      .order("created_at", { ascending: true });
    setComments(data || []);
  }, [postId]);

  useEffect(() => {
    Promise.all([fetchPost(), fetchComments()]).then(() => setLoading(false));
  }, [fetchPost, fetchComments]);

  // ── 공유 — /community/{postId} 고정 URL
  const handleShare = async () => {
    const url = `https://unit-converter-magic.vercel.app/community/${postId}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: post?.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        showToast("링크가 복사되었습니다! 🔗");
      }
    } catch {
      const el = document.createElement("textarea");
      el.value = url; document.body.appendChild(el); el.select();
      document.execCommand("copy"); document.body.removeChild(el);
      showToast("링크가 복사되었습니다! 🔗");
    }
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  const handleLike = async () => {
    await supabase.from("posts").update({ like_count: post.like_count + 1 }).eq("id", postId);
    setPost(p => ({ ...p, like_count: p.like_count + 1 }));
  };

  const openEditPwModal = () => { setEditPwModal(true); setEditPwInput(""); setEditPwError(""); };
  const confirmEditPw = () => {
    if (editPwInput !== post.post_password && editPwInput !== adminPw) {
      setEditPwError("비밀번호가 올바르지 않습니다."); return;
    }
    setEditPwModal(false);
    setEditForm({ title: post.title, content: post.content });
    setEditMode(true);
  };

  const saveEdit = async () => {
    if (!editForm.title.trim() || !editForm.content.trim()) return;
    const { error } = await supabase.from("posts")
      .update({ title: editForm.title.trim(), content: editForm.content.trim() })
      .eq("id", postId);
    if (!error) { await fetchPost(); setEditMode(false); showToast("수정이 완료되었습니다 ✅"); }
  };

  const openDeleteModal = (type, id) => { setDeleteModal({ type, id }); setPwInput(""); setPwError(""); };
  const executeDelete = async () => {
    if (pwInput !== adminPw) { setPwError("비밀번호가 올바르지 않습니다."); return; }
    if (deleteModal.type === "post") {
      await supabase.from("posts").delete().eq("id", deleteModal.id);
      setDeleteModal(null); onBack();
    } else {
      await supabase.from("comments").delete().eq("id", deleteModal.id);
      setDeleteModal(null); await fetchComments();
    }
  };

  const submitComment = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    await supabase.from("comments").insert({
      post_id: postId, parent_id: replyTo?.id || null,
      author_name: authorName.trim() || "익명", content: commentText.trim(),
    });
    setCommentText(""); setReplyTo(null);
    await fetchComments(); setSubmitting(false);
  };

  if (loading) return <div style={s.loading}>불러오는 중...</div>;
  if (!post)   return <div style={s.loading}>게시글을 찾을 수 없습니다.</div>;

  const cat = post.categories;
  const rootComments = comments.filter(c => !c.parent_id);
  const getReplies   = (id) => comments.filter(c => c.parent_id === id);

  return (
    <div style={s.wrap}>
      {toast && <div style={s.toast}>{toast}</div>}

      <button onClick={onBack} style={s.backBtn}>← 목록으로</button>

      <div style={s.postHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
          {cat && <span style={{ ...s.catBadge, background: cat.color + "22", color: cat.color }}>{cat.icon} {cat.name_ko}</span>}
          {post.is_pinned && <span style={s.pinBadge}>📌 공지</span>}
        </div>
        {editMode ? (
          <input value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
            style={{ ...s.editInput, fontSize: 20, fontWeight: 800, marginBottom: 12 }} />
        ) : (
          <h2 style={s.postTitle}>{post.title}</h2>
        )}
        <div style={s.meta}>
          <span style={s.metaText}>{post.author_name}</span>
          <span style={s.metaDot}>·</span>
          <span style={s.metaText}>{formatDate(post.created_at)}</span>
          <span style={s.metaDot}>·</span>
          <span style={s.metaText}>조회 {post.view_count.toLocaleString()}</span>
          <span style={s.metaDot}>·</span>
          {!editMode && <button onClick={openEditPwModal} style={s.editBtn}>✏️ 수정</button>}
          <span style={s.metaDot}>·</span>
          <button onClick={() => openDeleteModal("post", post.id)} style={s.deleteBtn}>🗑 관리자 삭제</button>
        </div>
      </div>

      <div style={s.body}>
        {editMode ? (
          <>
            <textarea value={editForm.content} onChange={e => setEditForm(f => ({ ...f, content: e.target.value }))}
              rows={10} style={s.editTextarea} />
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 10 }}>
              <button onClick={() => setEditMode(false)} style={s.btnSecondary}>취소</button>
              <button onClick={saveEdit} style={s.btnPrimary}>저장</button>
            </div>
          </>
        ) : (
          <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.8, margin: 0 }}>{post.content}</p>
        )}
      </div>

      {!editMode && (
        <div style={s.actionRow}>
          <button onClick={handleLike} style={s.likeBtn}>♥ 추천 {post.like_count}</button>
          <button onClick={handleShare} style={s.shareBtn}>🔗 공유하기</button>
        </div>
      )}

      <div style={s.commentSection}>
        <h3 style={s.commentTitle}>댓글 {post.comment_count}</h3>
        {rootComments.length === 0 ? (
          <p style={{ color: "#94a3b8", fontSize: 14, textAlign: "center", padding: "20px 0" }}>첫 댓글을 남겨보세요 💬</p>
        ) : (
          rootComments.map(c => (
            <CommentItem key={c.id} comment={c} replies={getReplies(c.id)}
              onReply={() => setReplyTo({ id: c.id, author_name: c.author_name })}
              onDelete={() => openDeleteModal("comment", c.id)} />
          ))
        )}
        <div style={s.commentForm}>
          {replyTo && (
            <div style={s.replyBanner}>
              💬 <strong>{replyTo.author_name}</strong>에게 답글 작성 중
              <button onClick={() => setReplyTo(null)} style={s.replyClose}>✕</button>
            </div>
          )}
          <div style={s.commentInputRow}>
            <input value={authorName} onChange={e => setAuthorName(e.target.value)}
              placeholder="닉네임 (미입력 시 익명)" style={{ ...s.inputSm, width: 160 }} />
          </div>
          <textarea value={commentText} onChange={e => setCommentText(e.target.value)}
            placeholder={replyTo ? `@${replyTo.author_name}에게 답글...` : "댓글을 입력하세요..."}
            rows={3} style={s.textarea}
            onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) submitComment(); }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
            <span style={{ fontSize: 12, color: "#94a3b8" }}>Ctrl+Enter로 빠른 등록</span>
            <button onClick={submitComment} disabled={submitting} style={s.btnPrimary}>
              {submitting ? "등록 중..." : replyTo ? "답글 등록" : "댓글 등록"}
            </button>
          </div>
        </div>
      </div>

      {editPwModal && (
        <div style={s.modalOverlay}>
          <div style={s.modal}>
            <h3 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 700 }}>게시글 수정</h3>
            <p style={{ margin: "0 0 16px", fontSize: 13, color: "#64748b" }}>작성 시 입력한 비밀번호를 입력하세요.</p>
            <input type="password" value={editPwInput}
              onChange={e => { setEditPwInput(e.target.value); setEditPwError(""); }}
              onKeyDown={e => { if (e.key === "Enter") confirmEditPw(); }}
              placeholder="비밀번호" autoFocus style={s.pwInput} />
            {editPwError && <p style={{ color: "#ef4444", fontSize: 13, margin: "6px 0 0" }}>{editPwError}</p>}
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
              <button onClick={() => setEditPwModal(false)} style={s.btnSecondary}>취소</button>
              <button onClick={confirmEditPw} style={s.btnPrimary}>확인</button>
            </div>
          </div>
        </div>
      )}

      {deleteModal && (
        <div style={s.modalOverlay}>
          <div style={s.modal}>
            <h3 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 700 }}>
              {deleteModal.type === "post" ? "게시글 삭제" : "댓글 삭제"}
            </h3>
            <p style={{ margin: "0 0 16px", fontSize: 13, color: "#64748b" }}>관리자 비밀번호를 입력하세요.</p>
            <input type="password" value={pwInput}
              onChange={e => { setPwInput(e.target.value); setPwError(""); }}
              onKeyDown={e => { if (e.key === "Enter") executeDelete(); }}
              placeholder="비밀번호" autoFocus style={s.pwInput} />
            {pwError && <p style={{ color: "#ef4444", fontSize: 13, margin: "6px 0 0" }}>{pwError}</p>}
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
              <button onClick={() => setDeleteModal(null)} style={s.btnSecondary}>취소</button>
              <button onClick={executeDelete} style={s.btnDanger}>삭제</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CommentItem({ comment, replies, onReply, onDelete }) {
  return (
    <div style={s.commentItem}>
      <div style={s.commentHead}>
        <span style={s.commentAuthor}>{comment.author_name}</span>
        <span style={s.commentDate}>{formatDate(comment.created_at)}</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
          <button onClick={onReply} style={s.textBtn}>답글</button>
          <button onClick={onDelete} style={{ ...s.textBtn, color: "#ef4444" }}>🗑 삭제</button>
        </div>
      </div>
      <p style={{ whiteSpace: "pre-wrap", margin: "6px 0 0", lineHeight: 1.7, fontSize: 14 }}>{comment.content}</p>
      {replies.length > 0 && (
        <div style={s.replies}>
          {replies.map(r => <CommentItem key={r.id} comment={r} replies={[]} onReply={onReply} onDelete={onDelete} />)}
        </div>
      )}
    </div>
  );
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }) + " " +
         d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}

const s = {
  wrap:            { width: "100%", padding: "24px 32px", fontFamily: "'Pretendard','Noto Sans KR',sans-serif", color: "#1e293b", boxSizing: "border-box", position: "relative" },
  loading:         { textAlign: "center", padding: "80px 0", color: "#94a3b8" },
  backBtn:         { background: "none", border: "none", cursor: "pointer", color: "#6366f1", fontWeight: 700, fontSize: 14, padding: "0 0 20px", display: "block" },
  postHeader:      { marginBottom: 20, paddingBottom: 16, borderBottom: "2px solid #f1f5f9" },
  catBadge:        { display: "inline-block", padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 700 },
  pinBadge:        { display: "inline-block", padding: "3px 8px", borderRadius: 12, fontSize: 11, background: "#fef3c7", color: "#d97706", fontWeight: 700 },
  postTitle:       { margin: "8px 0 12px", fontSize: 22, fontWeight: 800, lineHeight: 1.4 },
  meta:            { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  metaDot:         { color: "#cbd5e1" },
  metaText:        { fontSize: 13, color: "#64748b" },
  editBtn:         { background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#6366f1", fontWeight: 600, padding: 0 },
  deleteBtn:       { background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#94a3b8", padding: 0 },
  body:            { padding: "24px 0", borderBottom: "1.5px solid #f1f5f9" },
  editInput:       { width: "100%", padding: "8px 12px", borderRadius: 8, border: "1.5px solid #6366f1", outline: "none", boxSizing: "border-box" },
  editTextarea:    { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #6366f1", fontSize: 14, resize: "vertical", outline: "none", boxSizing: "border-box", lineHeight: 1.8 },
  actionRow:       { display: "flex", justifyContent: "center", alignItems: "center", gap: 12, padding: "20px 0" },
  likeBtn:         { padding: "10px 28px", borderRadius: 24, border: "2px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: 15, fontWeight: 700, color: "#94a3b8" },
  shareBtn:        { padding: "10px 24px", borderRadius: 24, border: "2px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: 15, fontWeight: 700, color: "#6366f1" },
  toast:           { position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)", background: "#1e293b", color: "#fff", padding: "12px 24px", borderRadius: 24, fontSize: 14, fontWeight: 600, zIndex: 9999, boxShadow: "0 4px 16px rgba(0,0,0,.2)", whiteSpace: "nowrap" },
  commentSection:  { marginTop: 8 },
  commentTitle:    { fontSize: 16, fontWeight: 800, marginBottom: 16 },
  commentItem:     { padding: "14px 0", borderBottom: "1px solid #f1f5f9" },
  commentHead:     { display: "flex", alignItems: "center", gap: 8, marginBottom: 4 },
  commentAuthor:   { fontSize: 13, fontWeight: 700, color: "#334155" },
  commentDate:     { fontSize: 12, color: "#94a3b8" },
  replies:         { marginLeft: 24, paddingLeft: 16, borderLeft: "2.5px solid #e2e8f0", marginTop: 12 },
  textBtn:         { background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#6366f1", fontWeight: 600, padding: 0 },
  commentForm:     { marginTop: 20, paddingTop: 20, borderTop: "1.5px solid #f1f5f9" },
  commentInputRow: { marginBottom: 8 },
  replyBanner:     { background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#1d4ed8", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 },
  replyClose:      { marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#6b7280" },
  textarea:        { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14, resize: "vertical", outline: "none", boxSizing: "border-box" },
  inputSm:         { padding: "7px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none" },
  btnPrimary:      { padding: "9px 20px", borderRadius: 8, border: "none", background: "#6366f1", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 700 },
  btnSecondary:    { padding: "8px 14px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff", color: "#64748b", cursor: "pointer", fontSize: 13 },
  btnDanger:       { padding: "8px 16px", borderRadius: 8, border: "none", background: "#ef4444", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700 },
  modalOverlay:    { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 },
  modal:           { background: "#fff", borderRadius: 14, padding: "28px 28px 24px", width: 320, maxWidth: "90vw", boxShadow: "0 8px 32px rgba(0,0,0,.18)" },
  pwInput:         { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 15, outline: "none", boxSizing: "border-box" },
};
