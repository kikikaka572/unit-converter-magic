// BoardPost.jsx — 게시글 상세 + 댓글 + 좋아요
// props: postId, supabase, session, onBack, onSignIn

import { useState, useEffect, useCallback } from "react";

export default function BoardPost({ postId, supabase, session, onBack, onSignIn }) {
  const [post,        setPost]        = useState(null);
  const [comments,    setComments]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [liked,       setLiked]       = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyTo,     setReplyTo]     = useState(null); // { id, author_name }
  const [submitting,  setSubmitting]  = useState(false);
  const [editing,     setEditing]     = useState(null); // post id or comment id
  const [editContent, setEditContent] = useState("");

  // ── 게시글 + 조회수 증가
  const fetchPost = useCallback(async () => {
    const { data } = await supabase
      .from("posts")
      .select("*, categories(slug, name_ko, icon, color)")
      .eq("id", postId)
      .single();
    if (data) {
      setPost(data);
      await supabase.rpc("increment_view_count", { post_uuid: postId });
    }
  }, [postId, supabase]);

  // ── 댓글 목록
  const fetchComments = useCallback(async () => {
    const { data } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", postId)
      .eq("is_hidden", false)
      .order("created_at", { ascending: true });
    setComments(data || []);
  }, [postId, supabase]);

  // ── 좋아요 여부 확인
  const checkLiked = useCallback(async () => {
    if (!session) return;
    const { data } = await supabase
      .from("post_likes")
      .select("post_id")
      .eq("user_id", session.user.id)
      .eq("post_id", postId)
      .maybeSingle();
    setLiked(!!data);
  }, [postId, session, supabase]);

  useEffect(() => {
    Promise.all([fetchPost(), fetchComments(), checkLiked()]).then(() => setLoading(false));
  }, [fetchPost, fetchComments, checkLiked]);

  // ── 좋아요 토글
  const toggleLike = async () => {
    if (!session) { onSignIn(); return; }
    if (liked) {
      await supabase.from("post_likes").delete()
        .eq("user_id", session.user.id).eq("post_id", postId);
      await supabase.from("posts").update({ like_count: post.like_count - 1 }).eq("id", postId);
      setPost(p => ({ ...p, like_count: p.like_count - 1 }));
    } else {
      await supabase.from("post_likes").insert({ user_id: session.user.id, post_id: postId });
      await supabase.from("posts").update({ like_count: post.like_count + 1 }).eq("id", postId);
      setPost(p => ({ ...p, like_count: p.like_count + 1 }));
    }
    setLiked(l => !l);
  };

  // ── 댓글 등록
  const submitComment = async () => {
    if (!session) { onSignIn(); return; }
    if (!commentText.trim()) return;
    setSubmitting(true);
    await supabase.from("comments").insert({
      post_id:      postId,
      parent_id:    replyTo?.id || null,
      author_id:    session.user.id,
      author_name:  session.user.user_metadata?.full_name || session.user.email?.split("@")[0],
      author_avatar: session.user.user_metadata?.avatar_url,
      content:      commentText.trim(),
    });
    setCommentText("");
    setReplyTo(null);
    await fetchComments();
    setSubmitting(false);
  };

  // ── 댓글 삭제
  const deleteComment = async (commentId) => {
    if (!window.confirm("댓글을 삭제할까요?")) return;
    await supabase.from("comments").delete().eq("id", commentId);
    await fetchComments();
  };

  // ── 게시글 삭제
  const deletePost = async () => {
    if (!window.confirm("게시글을 삭제할까요?")) return;
    await supabase.from("posts").delete().eq("id", postId);
    onBack();
  };

  // ── 수정 저장
  const saveEdit = async (type, id) => {
    if (!editContent.trim()) return;
    if (type === "post") {
      await supabase.from("posts").update({ content: editContent.trim() }).eq("id", id);
      await fetchPost();
    } else {
      await supabase.from("comments").update({ content: editContent.trim() }).eq("id", id);
      await fetchComments();
    }
    setEditing(null);
    setEditContent("");
  };

  if (loading) return <div style={s.loading}>불러오는 중...</div>;
  if (!post)   return <div style={s.loading}>게시글을 찾을 수 없습니다.</div>;

  const isAuthor = session?.user.id === post.author_id;
  const cat = post.categories;

  // ── 트리 구조: 최상위 댓글 + 대댓글
  const rootComments = comments.filter(c => !c.parent_id);
  const getReplies   = (id) => comments.filter(c => c.parent_id === id);

  return (
    <div style={s.wrap}>
      {/* ── 뒤로가기 */}
      <button onClick={onBack} style={s.backBtn}>← 목록으로</button>

      {/* ── 카테고리 + 제목 */}
      <div style={s.postHeader}>
        {cat && (
          <span style={{ ...s.catBadge, background: cat.color + "22", color: cat.color }}>
            {cat.icon} {cat.name_ko}
          </span>
        )}
        {post.is_pinned && <span style={s.pinBadge}>📌 공지</span>}
        <h2 style={s.postTitle}>{post.title}</h2>
        <div style={s.meta}>
          <div style={s.authorRow}>
            {post.author_avatar && <img src={post.author_avatar} style={s.avatarSm} alt="" />}
            <span style={s.authorName}>{post.author_name}</span>
          </div>
          <span style={s.metaDot}>·</span>
          <span style={s.metaText}>{formatDate(post.created_at)}</span>
          <span style={s.metaDot}>·</span>
          <span style={s.metaText}>조회 {post.view_count.toLocaleString()}</span>
          {isAuthor && (
            <>
              <span style={s.metaDot}>·</span>
              <button onClick={() => { setEditing(post.id); setEditContent(post.content); }} style={s.textBtn}>수정</button>
              <button onClick={deletePost} style={{ ...s.textBtn, color: "#ef4444" }}>삭제</button>
            </>
          )}
        </div>
      </div>

      {/* ── 본문 */}
      <div style={s.body}>
        {editing === post.id ? (
          <>
            <textarea
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              rows={8}
              style={s.textarea}
            />
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
              <button onClick={() => setEditing(null)} style={s.btnSm}>취소</button>
              <button onClick={() => saveEdit("post", post.id)} style={s.btnSmPrimary}>저장</button>
            </div>
          </>
        ) : (
          <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.8, margin: 0 }}>{post.content}</p>
        )}
      </div>

      {/* ── 좋아요 */}
      <div style={s.likeRow}>
        <button onClick={toggleLike} style={{ ...s.likeBtn, ...(liked ? s.likeBtnActive : {}) }}>
          ♥ 추천 {post.like_count}
        </button>
      </div>

      {/* ── 댓글 섹션 */}
      <div style={s.commentSection}>
        <h3 style={s.commentTitle}>댓글 {post.comment_count}</h3>

        {/* 댓글 목록 */}
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
              session={session}
              editing={editing}
              editContent={editContent}
              setEditing={setEditing}
              setEditContent={setEditContent}
              setReplyTo={setReplyTo}
              onDelete={deleteComment}
              onSaveEdit={saveEdit}
            />
          ))
        )}

        {/* 댓글 입력 */}
        <div style={s.commentForm}>
          {replyTo && (
            <div style={s.replyBanner}>
              💬 <strong>{replyTo.author_name}</strong>에게 답글 작성 중
              <button onClick={() => setReplyTo(null)} style={s.replyClose}>✕</button>
            </div>
          )}
          {session ? (
            <>
              <textarea
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder={replyTo ? `@${replyTo.author_name}에게 답글...` : "댓글을 입력하세요..."}
                rows={3}
                style={s.textarea}
              />
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                <button onClick={submitComment} disabled={submitting} style={s.btnPrimary}>
                  {submitting ? "등록 중..." : replyTo ? "답글 등록" : "댓글 등록"}
                </button>
              </div>
            </>
          ) : (
            <div style={s.loginPrompt}>
              <span style={{ color: "#64748b", fontSize: 14 }}>댓글을 작성하려면 로그인이 필요합니다</span>
              <button onClick={onSignIn} style={s.btnGoogle}>
                <svg width="16" height="16" viewBox="0 0 18 18" style={{ marginRight: 6 }}>
                  <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                  <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                  <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18z"/>
                  <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
                </svg>
                Google로 로그인
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── 댓글 아이템 (대댓글 포함)
function CommentItem({ comment, replies, session, editing, editContent, setEditing, setEditContent, setReplyTo, onDelete, onSaveEdit }) {
  const isAuthor = session?.user.id === comment.author_id;
  return (
    <div style={s.commentItem}>
      <div style={s.commentHead}>
        {comment.author_avatar && <img src={comment.author_avatar} style={s.avatarSm} alt="" />}
        <span style={s.commentAuthor}>{comment.author_name}</span>
        <span style={s.commentDate}>{formatDate(comment.created_at)}</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button onClick={() => setReplyTo({ id: comment.id, author_name: comment.author_name })} style={s.textBtn}>답글</button>
          {isAuthor && (
            <>
              <button onClick={() => { setEditing(comment.id); setEditContent(comment.content); }} style={s.textBtn}>수정</button>
              <button onClick={() => onDelete(comment.id)} style={{ ...s.textBtn, color: "#ef4444" }}>삭제</button>
            </>
          )}
        </div>
      </div>
      {editing === comment.id ? (
        <>
          <textarea value={editContent} onChange={e => setEditContent(e.target.value)} rows={3} style={s.textarea} />
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 6 }}>
            <button onClick={() => setEditing(null)} style={s.btnSm}>취소</button>
            <button onClick={() => onSaveEdit("comment", comment.id)} style={s.btnSmPrimary}>저장</button>
          </div>
        </>
      ) : (
        <p style={{ whiteSpace: "pre-wrap", margin: "6px 0 0", lineHeight: 1.7, fontSize: 14 }}>{comment.content}</p>
      )}
      {/* 대댓글 */}
      {replies.length > 0 && (
        <div style={s.replies}>
          {replies.map(r => (
            <CommentItem key={r.id} comment={r} replies={[]} session={session}
              editing={editing} editContent={editContent}
              setEditing={setEditing} setEditContent={setEditContent}
              setReplyTo={setReplyTo} onDelete={onDelete} onSaveEdit={onSaveEdit} />
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

// ── 스타일
const s = {
  wrap:           { maxWidth: 800, margin: "0 auto", padding: "24px 16px", fontFamily: "'Pretendard', 'Noto Sans KR', sans-serif", color: "#1e293b" },
  loading:        { textAlign: "center", padding: "80px 0", color: "#94a3b8" },
  backBtn:        { background: "none", border: "none", cursor: "pointer", color: "#6366f1", fontWeight: 700, fontSize: 14, padding: "0 0 20px", display: "block" },
  postHeader:     { marginBottom: 20, paddingBottom: 16, borderBottom: "2px solid #f1f5f9" },
  catBadge:       { display: "inline-block", padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 700, marginBottom: 10 },
  pinBadge:       { display: "inline-block", marginLeft: 8, padding: "3px 8px", borderRadius: 12, fontSize: 11, background: "#fef3c7", color: "#d97706", fontWeight: 700 },
  postTitle:      { margin: "8px 0 12px", fontSize: 22, fontWeight: 800, lineHeight: 1.4 },
  meta:           { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  authorRow:      { display: "flex", alignItems: "center", gap: 6 },
  avatarSm:       { width: 24, height: 24, borderRadius: "50%", objectFit: "cover" },
  authorName:     { fontSize: 14, fontWeight: 600, color: "#334155" },
  metaDot:        { color: "#cbd5e1" },
  metaText:       { fontSize: 13, color: "#64748b" },
  textBtn:        { background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#6366f1", fontWeight: 600, padding: 0 },
  body:           { padding: "24px 0", lineHeight: 1.8, borderBottom: "1.5px solid #f1f5f9" },
  likeRow:        { display: "flex", justifyContent: "center", padding: "20px 0" },
  likeBtn:        { padding: "10px 28px", borderRadius: 24, border: "2px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: 15, fontWeight: 700, color: "#94a3b8", transition: "all .15s" },
  likeBtnActive:  { background: "#fef2f2", borderColor: "#f87171", color: "#ef4444" },
  commentSection: { marginTop: 8 },
  commentTitle:   { fontSize: 16, fontWeight: 800, marginBottom: 16, color: "#1e293b" },
  commentItem:    { padding: "14px 0", borderBottom: "1px solid #f1f5f9" },
  commentHead:    { display: "flex", alignItems: "center", gap: 8, marginBottom: 4 },
  commentAuthor:  { fontSize: 13, fontWeight: 700, color: "#334155" },
  commentDate:    { fontSize: 12, color: "#94a3b8" },
  replies:        { marginLeft: 24, paddingLeft: 16, borderLeft: "2.5px solid #e2e8f0", marginTop: 12 },
  commentForm:    { marginTop: 20, paddingTop: 20, borderTop: "1.5px solid #f1f5f9" },
  replyBanner:    { background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#1d4ed8", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 },
  replyClose:     { marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#6b7280" },
  textarea:       { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14, resize: "vertical", outline: "none", boxSizing: "border-box" },
  loginPrompt:    { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", background: "#f8fafc", borderRadius: 10, border: "1.5px dashed #e2e8f0" },
  btnPrimary:     { padding: "9px 20px", borderRadius: 8, border: "none", background: "#6366f1", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 700 },
  btnSm:          { padding: "6px 12px", borderRadius: 6, border: "1.5px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: 12, color: "#64748b" },
  btnSmPrimary:   { padding: "6px 12px", borderRadius: 6, border: "none", background: "#6366f1", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700 },
  btnGoogle:      { display: "flex", alignItems: "center", padding: "7px 14px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#334155" },
};

