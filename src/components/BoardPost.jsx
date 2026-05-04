// BoardPost.jsx — 익명 게시글 상세 + 관리자 비밀번호 삭제
// props: postId, supabase, adminPw, onBack

import { useState, useEffect, useCallback } from "react";

export default function BoardPost({ postId, supabase, adminPw, onBack }) {
  const [post,        setPost]        = useState(null);
  const [comments,    setComments]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [commentText, setCommentText] = useState("");
  const [authorName,  setAuthorName]  = useState("");
  const [replyTo,     setReplyTo]     = useState(null);
  const [submitting,  setSubmitting]  = useState(false);

  // 관리자 삭제 모달 상태
  const [deleteModal, setDeleteModal] = useState(null); // { type: "post"|"comment", id }
  const [pwInput,     setPwInput]     = useState("");
  const [pwError,     setPwError]     = useState("");

  const fetchPost = useCallback(async () => {
    const { data } = await supabase
      .from("posts")
      .select("*, categories(slug, name_ko, icon, color)")
      .eq("id", postId).single();
    if (data) {
      setPost(data);
      await supabase.rpc("increment_view_count", { post_uuid: postId });
    }
  }, [postId, supabase]);

  const fetchComments = useCallback(async () => {
    const { data } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", postId)
      .eq("is_hidden", false)
      .order("created_at", { ascending: true });
    setComments(data || []);
  }, [postId, supabase]);

  useEffect(() => {
    Promise.all([fetchPost(), fetchComments()]).then(() => setLoading(false));
  }, [fetchPost, fetchComments]);

  // ── 좋아요 (단순 카운트 증가, 중복 방지 없음)
  const handleLike = async () => {
    await supabase.from("posts").update({ like_count: post.like_count + 1 }).eq("id", postId);
    setPost(p => ({ ...p, like_count: p.like_count + 1 }));
  };

  // ── 댓글 등록
  const submitComment = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    await supabase.from("comments").insert({
      post_id:     postId,
      parent_id:   replyTo?.id || null,
      author_name: authorName.trim() || "익명",
      content:     commentText.trim(),
    });
    setCommentText(""); setReplyTo(null);
    await fetchComments();
    setSubmitting(false);
  };

  // ── 관리자 삭제 모달 열기
  const openDeleteModal = (type, id) => {
    setDeleteModal({ type, id });
    setPwInput(""); setPwError("");
  };

  // ── 삭제 실행
  const executeDelete = async () => {
    if (pwInput !== adminPw) {
      setPwError("비밀번호가 올바르지 않습니다.");
      return;
    }
    if (deleteModal.type === "post") {
      await supabase.from("posts").delete().eq("id", deleteModal.id);
      setDeleteModal(null);
      onBack();
    } else {
      await supabase.from("comments").delete().eq("id", deleteModal.id);
      setDeleteModal(null);
      await fetchComments();
    }
  };

  if (loading) return <div style={s.loading}>불러오는 중...</div>;
  if (!post)   return <div style={s.loading}>게시글을 찾을 수 없습니다.</div>;

  const cat = post.categories;
  const rootComments = comments.filter(c => !c.parent_id);
  const getReplies   = (id) => comments.filter(c => c.parent_id === id);

  return (
    <div style={s.wrap}>
      {/* ── 뒤로가기 */}
      <button onClick={onBack} style={s.backBtn}>← 목록으로</button>

      {/* ── 게시글 헤더 */}
      <div style={s.postHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
          {cat && (
            <span style={{ ...s.catBadge, background: cat.color + "22", color: cat.color }}>
              {cat.icon} {cat.name_ko}
            </span>
          )}
          {post.is_pinned && <span style={s.pinBadge}>📌 공지</span>}
        </div>
        <h2 style={s.postTitle}>{post.title}</h2>
        <div style={s.meta}>
          <span style={s.metaText}>{post.author_name}</span>
          <span style={s.metaDot}>·</span>
          <span style={s.metaText}>{formatDate(post.created_at)}</span>
          <span style={s.metaDot}>·</span>
          <span style={s.metaText}>조회 {post.view_count.toLocaleString()}</span>
          <span style={s.metaDot}>·</span>
          {/* 관리자 삭제 버튼 */}
          <button onClick={() => openDeleteModal("post", post.id)} style={s.deleteBtn}>
            🗑 관리자 삭제
          </button>
        </div>
      </div>

      {/* ── 본문 */}
      <div style={s.body}>
        <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.8, margin: 0 }}>{post.content}</p>
      </div>

      {/* ── 좋아요 */}
      <div style={s.likeRow}>
        <button onClick={handleLike} style={s.likeBtn}>♥ 추천 {post.like_count}</button>
      </div>

      {/* ── 댓글 */}
      <div style={s.commentSection}>
        <h3 style={s.commentTitle}>댓글 {post.comment_count}</h3>

        {rootComments.length === 0 ? (
          <p style={{ color: "#94a3b8", fontSize: 14, textAlign: "center", padding: "20px 0" }}>
            첫 댓글을 남겨보세요 💬
          </p>
        ) : (
          rootComments.map(c => (
            <CommentItem
              key={c.id}
              comment={c}
              replies={getReplies(c.id)}
              onReply={() => setReplyTo({ id: c.id, author_name: c.author_name })}
              onDelete={() => openDeleteModal("comment", c.id)}
            />
          ))
        )}

        {/* ── 댓글 입력 */}
        <div style={s.commentForm}>
          {replyTo && (
            <div style={s.replyBanner}>
              💬 <strong>{replyTo.author_name}</strong>에게 답글 작성 중
              <button onClick={() => setReplyTo(null)} style={s.replyClose}>✕</button>
            </div>
          )}
          <div style={s.commentInputRow}>
            <input
              value={authorName}
              onChange={e => setAuthorName(e.target.value)}
              placeholder="닉네임 (미입력 시 익명)"
              style={{ ...s.inputSm, width: 160 }}
            />
          </div>
          <textarea
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            placeholder={replyTo ? `@${replyTo.author_name}에게 답글...` : "댓글을 입력하세요..."}
            rows={3}
            style={s.textarea}
            onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) submitComment(); }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
            <span style={{ fontSize: 12, color: "#94a3b8" }}>Ctrl+Enter로 빠른 등록</span>
            <button onClick={submitComment} disabled={submitting} style={s.btnPrimary}>
              {submitting ? "등록 중..." : replyTo ? "답글 등록" : "댓글 등록"}
            </button>
          </div>
        </div>
      </div>

      {/* ── 관리자 삭제 모달 */}
      {deleteModal && (
        <div style={s.modalOverlay}>
          <div style={s.modal}>
            <h3 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 700 }}>
              {deleteModal.type === "post" ? "게시글 삭제" : "댓글 삭제"}
            </h3>
            <p style={{ margin: "0 0 16px", fontSize: 13, color: "#64748b" }}>
              관리자 비밀번호를 입력하세요.
            </p>
            <input
              type="password"
              value={pwInput}
              onChange={e => { setPwInput(e.target.value); setPwError(""); }}
              onKeyDown={e => { if (e.key === "Enter") executeDelete(); }}
              placeholder="비밀번호"
              autoFocus
              style={s.pwInput}
            />
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

// ── 댓글 아이템
function CommentItem({ comment, replies, onReply, onDelete }) {
  return (
    <div style={s.commentItem}>
      <div style={s.commentHead}>
        <span style={s.commentAuthor}>{comment.author_name}</span>
        <span style={s.commentDate}>{formatDate(comment.created_at)}</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
          <button onClick={onReply}  style={s.textBtn}>답글</button>
          <button onClick={onDelete} style={{ ...s.textBtn, color: "#ef4444" }}>🗑 삭제</button>
        </div>
      </div>
      <p style={{ whiteSpace: "pre-wrap", margin: "6px 0 0", lineHeight: 1.7, fontSize: 14 }}>
        {comment.content}
      </p>
      {replies.length > 0 && (
        <div style={s.replies}>
          {replies.map(r => (
            <CommentItem key={r.id} comment={r} replies={[]} onReply={onReply} onDelete={onDelete} />
          ))}
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
  wrap:            { maxWidth: 800, margin: "0 auto", padding: "24px 16px", fontFamily: "'Pretendard','Noto Sans KR',sans-serif", color: "#1e293b" },
  loading:         { textAlign: "center", padding: "80px 0", color: "#94a3b8" },
  backBtn:         { background: "none", border: "none", cursor: "pointer", color: "#6366f1", fontWeight: 700, fontSize: 14, padding: "0 0 20px", display: "block" },
  postHeader:      { marginBottom: 20, paddingBottom: 16, borderBottom: "2px solid #f1f5f9" },
  catBadge:        { display: "inline-block", padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 700 },
  pinBadge:        { display: "inline-block", padding: "3px 8px", borderRadius: 12, fontSize: 11, background: "#fef3c7", color: "#d97706", fontWeight: 700 },
  postTitle:       { margin: "8px 0 12px", fontSize: 22, fontWeight: 800, lineHeight: 1.4 },
  meta:            { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  metaDot:         { color: "#cbd5e1" },
  metaText:        { fontSize: 13, color: "#64748b" },
  deleteBtn:       { background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#94a3b8", padding: 0 },
  body:            { padding: "24px 0", borderBottom: "1.5px solid #f1f5f9" },
  likeRow:         { display: "flex", justifyContent: "center", padding: "20px 0" },
  likeBtn:         { padding: "10px 28px", borderRadius: 24, border: "2px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: 15, fontWeight: 700, color: "#94a3b8", transition: "all .15s" },
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
  // 모달 — position:fixed 대신 normal-flow min-height wrapper
  modalOverlay:    { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 },
  modal:           { background: "#fff", borderRadius: 14, padding: "28px 28px 24px", width: 320, maxWidth: "90vw", boxShadow: "0 8px 32px rgba(0,0,0,.18)" },
  pwInput:         { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 15, outline: "none", boxSizing: "border-box" },
};
