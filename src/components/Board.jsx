// Board.jsx — 게시판 메인 (목록 + 카테고리 필터 + Google 로그인)
// 의존성: @supabase/supabase-js, @supabase/auth-ui-react, @supabase/auth-ui-shared
// 설치: npm install @supabase/supabase-js @supabase/auth-ui-react @supabase/auth-ui-shared

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import BoardPost from "./BoardPost";

// ── Supabase 클라이언트 (환경변수로 교체)
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const CATEGORIES = [
  { slug: "all",      name_ko: "전체",      icon: "🌐", color: "#94a3b8" },
  { slug: "notice",   name_ko: "공지사항",  icon: "📢", color: "#ef4444" },
  { slug: "general",  name_ko: "자유게시판",icon: "💬", color: "#6366f1" },
  { slug: "qna",      name_ko: "Q&A",       icon: "❓", color: "#f59e0b" },
  { slug: "tips",     name_ko: "팁 & 노하우",icon: "💡",color: "#10b981" },
  { slug: "feedback", name_ko: "피드백",    icon: "📝", color: "#8b5cf6" },
];

const PAGE_SIZE = 15;

export default function Board() {
  const [session,      setSession]      = useState(null);
  const [posts,        setPosts]        = useState([]);
  const [totalCount,   setTotalCount]   = useState(0);
  const [activeCategory, setActiveCategory] = useState("all");
  const [page,         setPage]         = useState(1);
  const [loading,      setLoading]      = useState(true);
  const [showWrite,    setShowWrite]    = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [searchQuery,  setSearchQuery]  = useState("");
  const [searchInput,  setSearchInput]  = useState("");

  // ── 세션 감지
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  // ── 게시글 목록 로드
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("posts")
      .select(`
        id, title, author_name, author_avatar, view_count, like_count,
        comment_count, is_pinned, created_at,
        categories(slug, name_ko, icon, color)
      `, { count: "exact" })
      .eq("is_hidden", false)
      .order("is_pinned", { ascending: false })
      .order("created_at",  { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

    if (activeCategory !== "all") {
      const cat = CATEGORIES.find(c => c.slug === activeCategory);
      if (cat) {
        const { data: catRow } = await supabase
          .from("categories").select("id").eq("slug", activeCategory).single();
        if (catRow) query = query.eq("category_id", catRow.id);
      }
    }
    if (searchQuery) {
      query = query.ilike("title", `%${searchQuery}%`);
    }

    const { data, count, error } = await query;
    if (!error) {
      setPosts(data || []);
      setTotalCount(count || 0);
    }
    setLoading(false);
  }, [activeCategory, page, searchQuery]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  // ── 카테고리 변경 시 1페이지로 리셋
  const handleCategory = (slug) => {
    setActiveCategory(slug);
    setPage(1);
  };

  // ── Google 로그인
  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.href },
    });
  };
  const signOut = () => supabase.auth.signOut();

  // ── 글 작성 완료 콜백
  const handlePostCreated = () => {
    setShowWrite(false);
    setPage(1);
    fetchPosts();
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const activeCatInfo = CATEGORIES.find(c => c.slug === activeCategory);

  // ── 글 상세 뷰
  if (selectedPost) {
    return (
      <BoardPost
        postId={selectedPost}
        supabase={supabase}
        session={session}
        onBack={() => { setSelectedPost(null); fetchPosts(); }}
        onSignIn={signInWithGoogle}
      />
    );
  }

  return (
    <div style={styles.wrap}>
      {/* ── 헤더 */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>커뮤니티</h1>
          <p style={styles.subtitle}>단위 변환 팁, 질문, 자유로운 이야기를 나눠보세요</p>
        </div>
        <div style={styles.authArea}>
          {session ? (
            <div style={styles.userRow}>
              {session.user.user_metadata?.avatar_url && (
                <img src={session.user.user_metadata.avatar_url} style={styles.avatar} alt="avatar" />
              )}
              <span style={styles.userName}>
                {session.user.user_metadata?.full_name || session.user.email?.split("@")[0]}
              </span>
              <button onClick={signOut} style={styles.btnSecondary}>로그아웃</button>
              <button onClick={() => setShowWrite(true)} style={styles.btnPrimary}>✏️ 글쓰기</button>
            </div>
          ) : (
            <button onClick={signInWithGoogle} style={styles.btnGoogle}>
              <svg width="18" height="18" viewBox="0 0 18 18" style={{ marginRight: 8 }}>
                <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18z"/>
                <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
              </svg>
              Google로 로그인
            </button>
          )}
        </div>
      </div>

      {/* ── 글쓰기 폼 */}
      {showWrite && session && (
        <WriteForm
          supabase={supabase}
          session={session}
          categories={CATEGORIES.filter(c => c.slug !== "all")}
          onCreated={handlePostCreated}
          onCancel={() => setShowWrite(false)}
        />
      )}

      {/* ── 카테고리 탭 */}
      <div style={styles.catRow}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.slug}
            onClick={() => handleCategory(cat.slug)}
            style={{
              ...styles.catBtn,
              ...(activeCategory === cat.slug ? {
                background: cat.color,
                color: "#fff",
                borderColor: cat.color,
              } : {}),
            }}
          >
            {cat.icon} {cat.name_ko}
          </button>
        ))}
      </div>

      {/* ── 검색 */}
      <div style={styles.searchRow}>
        <input
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { setSearchQuery(searchInput); setPage(1); } }}
          placeholder="제목 검색..."
          style={styles.searchInput}
        />
        <button
          onClick={() => { setSearchQuery(searchInput); setPage(1); }}
          style={styles.btnSearch}
        >검색</button>
        {searchQuery && (
          <button onClick={() => { setSearchQuery(""); setSearchInput(""); setPage(1); }} style={styles.btnClear}>✕ 초기화</button>
        )}
        <span style={styles.countLabel}>총 {totalCount.toLocaleString()}개</span>
      </div>

      {/* ── 게시글 목록 */}
      {loading ? (
        <div style={styles.emptyBox}>불러오는 중...</div>
      ) : posts.length === 0 ? (
        <div style={styles.emptyBox}>게시글이 없습니다. 첫 글을 남겨보세요! 🙌</div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={{ ...styles.th, width: 80  }}>카테고리</th>
              <th style={{ ...styles.th, textAlign: "left" }}>제목</th>
              <th style={{ ...styles.th, width: 100 }}>작성자</th>
              <th style={{ ...styles.th, width: 70  }}>조회</th>
              <th style={{ ...styles.th, width: 60  }}>추천</th>
              <th style={{ ...styles.th, width: 90  }}>날짜</th>
            </tr>
          </thead>
          <tbody>
            {posts.map(post => (
              <PostRow
                key={post.id}
                post={post}
                onClick={() => setSelectedPost(post.id)}
              />
            ))}
          </tbody>
        </table>
      )}

      {/* ── 페이지네이션 */}
      {totalPages > 1 && (
        <div style={styles.pagination}>
          <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1} style={styles.pageBtn}>‹</button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            const p = page <= 4 ? i + 1 : page - 3 + i;
            if (p < 1 || p > totalPages) return null;
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{ ...styles.pageBtn, ...(p === page ? styles.pageBtnActive : {}) }}
              >{p}</button>
            );
          })}
          <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages} style={styles.pageBtn}>›</button>
        </div>
      )}
    </div>
  );
}

// ── 게시글 행 컴포넌트
function PostRow({ post, onClick }) {
  const cat = post.categories;
  const date = new Date(post.created_at);
  const isToday = new Date().toDateString() === date.toDateString();
  const dateStr = isToday
    ? date.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" });

  return (
    <tr style={styles.row} onClick={onClick}>
      <td style={{ ...styles.td, textAlign: "center" }}>
        {cat && (
          <span style={{ ...styles.catBadge, background: cat.color + "22", color: cat.color }}>
            {cat.icon} {cat.name_ko}
          </span>
        )}
      </td>
      <td style={styles.tdTitle}>
        {post.is_pinned && <span style={styles.pinBadge}>📌</span>}
        <span style={styles.titleText}>{post.title}</span>
        {post.comment_count > 0 && (
          <span style={styles.commentCount}>[{post.comment_count}]</span>
        )}
      </td>
      <td style={{ ...styles.td, textAlign: "center", fontSize: 13, color: "#64748b" }}>
        {post.author_name}
      </td>
      <td style={{ ...styles.td, textAlign: "center", fontSize: 13, color: "#94a3b8" }}>
        {post.view_count.toLocaleString()}
      </td>
      <td style={{ ...styles.td, textAlign: "center", fontSize: 13, color: "#f59e0b" }}>
        {post.like_count > 0 ? `♥ ${post.like_count}` : ""}
      </td>
      <td style={{ ...styles.td, textAlign: "center", fontSize: 12, color: "#94a3b8" }}>
        {dateStr}
      </td>
    </tr>
  );
}

// ── 글쓰기 폼
function WriteForm({ supabase, session, categories, onCreated, onCancel }) {
  const [form, setForm] = useState({ category: "general", title: "", content: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError("제목을 입력해주세요."); return; }
    if (!form.content.trim()) { setError("내용을 입력해주세요."); return; }
    setSubmitting(true);
    setError("");

    const { data: catRow } = await supabase
      .from("categories").select("id").eq("slug", form.category).single();

    const { error: err } = await supabase.from("posts").insert({
      category_id: catRow?.id,
      author_id:   session.user.id,
      author_name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0],
      author_avatar: session.user.user_metadata?.avatar_url,
      title:   form.title.trim(),
      content: form.content.trim(),
    });

    if (err) { setError(err.message); setSubmitting(false); return; }
    onCreated();
  };

  return (
    <div style={styles.writeBox}>
      <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>새 글 작성</h3>
      <div style={styles.formRow}>
        <select
          value={form.category}
          onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
          style={styles.select}
        >
          {categories.map(c => (
            <option key={c.slug} value={c.slug}>{c.icon} {c.name_ko}</option>
          ))}
        </select>
        <input
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          placeholder="제목"
          style={{ ...styles.input, flex: 1 }}
        />
      </div>
      <textarea
        value={form.content}
        onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
        placeholder="내용을 입력하세요..."
        rows={6}
        style={styles.textarea}
      />
      {error && <p style={{ color: "#ef4444", fontSize: 13, margin: "4px 0" }}>{error}</p>}
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button onClick={onCancel} style={styles.btnSecondary}>취소</button>
        <button onClick={handleSubmit} disabled={submitting} style={styles.btnPrimary}>
          {submitting ? "등록 중..." : "등록"}
        </button>
      </div>
    </div>
  );
}

// ── 스타일
const styles = {
  wrap:        { maxWidth: 900, margin: "0 auto", padding: "24px 16px", fontFamily: "'Pretendard', 'Noto Sans KR', sans-serif", color: "#1e293b" },
  header:      { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 },
  title:       { margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: "-0.5px" },
  subtitle:    { margin: "4px 0 0", fontSize: 14, color: "#64748b" },
  authArea:    { display: "flex", alignItems: "center" },
  userRow:     { display: "flex", alignItems: "center", gap: 10 },
  avatar:      { width: 32, height: 32, borderRadius: "50%", objectFit: "cover" },
  userName:    { fontSize: 14, fontWeight: 600, color: "#334155" },
  btnGoogle:   { display: "flex", alignItems: "center", padding: "8px 16px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#334155", boxShadow: "0 1px 3px rgba(0,0,0,.08)" },
  btnPrimary:  { padding: "8px 16px", borderRadius: 8, border: "none", background: "#6366f1", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 700 },
  btnSecondary:{ padding: "8px 14px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff", color: "#64748b", cursor: "pointer", fontSize: 13 },
  catRow:      { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  catBtn:      { padding: "6px 14px", borderRadius: 20, border: "1.5px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#475569", transition: "all .15s" },
  searchRow:   { display: "flex", gap: 8, alignItems: "center", marginBottom: 16, flexWrap: "wrap" },
  searchInput: { flex: 1, minWidth: 180, padding: "8px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none" },
  btnSearch:   { padding: "8px 14px", borderRadius: 8, border: "none", background: "#334155", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 },
  btnClear:    { padding: "8px 12px", borderRadius: 8, border: "1.5px solid #fca5a5", background: "#fff", color: "#ef4444", cursor: "pointer", fontSize: 13 },
  countLabel:  { marginLeft: "auto", fontSize: 13, color: "#94a3b8" },
  table:       { width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,.06)" },
  thead:       { background: "#f8fafc" },
  th:          { padding: "12px 10px", fontSize: 13, fontWeight: 700, color: "#64748b", textAlign: "center", borderBottom: "1.5px solid #e2e8f0" },
  row:         { cursor: "pointer", borderBottom: "1px solid #f1f5f9", transition: "background .12s" },
  td:          { padding: "13px 10px", fontSize: 14, verticalAlign: "middle" },
  tdTitle:     { padding: "13px 10px", fontSize: 14, verticalAlign: "middle" },
  titleText:   { color: "#1e293b", fontWeight: 500 },
  commentCount:{ marginLeft: 4, color: "#6366f1", fontSize: 13, fontWeight: 700 },
  pinBadge:    { marginRight: 6 },
  catBadge:    { display: "inline-block", padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 700 },
  emptyBox:    { textAlign: "center", padding: "60px 0", color: "#94a3b8", fontSize: 15 },
  pagination:  { display: "flex", justifyContent: "center", gap: 4, marginTop: 24 },
  pageBtn:     { width: 34, height: 34, borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: 14, color: "#475569", display: "flex", alignItems: "center", justifyContent: "center" },
  pageBtnActive:{ background: "#6366f1", color: "#fff", borderColor: "#6366f1", fontWeight: 700 },
  writeBox:    { background: "#f8fafc", borderRadius: 12, padding: "20px", marginBottom: 20, border: "1.5px solid #e2e8f0" },
  formRow:     { display: "flex", gap: 8, marginBottom: 10 },
  select:      { padding: "8px 10px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14, background: "#fff", cursor: "pointer" },
  input:       { padding: "8px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none" },
  textarea:    { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14, resize: "vertical", outline: "none", boxSizing: "border-box", marginBottom: 10 },
};

