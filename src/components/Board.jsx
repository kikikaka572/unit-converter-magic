// Board.jsx — 익명 게시판 (로그인 없음, 관리자 비밀번호 삭제)
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import BoardPost from "./BoardPost";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const ADMIN_PW = import.meta.env.VITE_ADMIN_PW || "800329";

const CATEGORIES = [
  { slug: "all",      name_ko: "전체",       icon: "🌐", color: "#94a3b8" },
  { slug: "notice",   name_ko: "공지사항",   icon: "📢", color: "#ef4444" },
  { slug: "general",  name_ko: "자유게시판", icon: "💬", color: "#6366f1" },
  { slug: "qna",      name_ko: "Q&A",        icon: "❓", color: "#f59e0b" },
  { slug: "tips",     name_ko: "꿀팁",   icon: "🐽", color: "#10b981" },
  { slug: "feedback", name_ko: "맛집",       icon: "🍕", color: "#8b5cf6" },
];

const PAGE_SIZE = 15;

export default function Board() {
  const [posts,          setPosts]          = useState([]);
  const [totalCount,     setTotalCount]     = useState(0);
  const [activeCategory, setActiveCategory] = useState("all");
  const [page,           setPage]           = useState(1);
  const [loading,        setLoading]        = useState(true);
  const [showWrite,      setShowWrite]      = useState(false);
  const [selectedPost,   setSelectedPost]   = useState(null);
  const [searchQuery,    setSearchQuery]    = useState("");
  const [searchInput,    setSearchInput]    = useState("");

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("posts")
      .select(`id, title, author_name, view_count, like_count, comment_count, is_pinned, created_at, categories(slug, name_ko, icon, color)`, { count: "exact" })
      .eq("is_hidden", false)
      .order("is_pinned",  { ascending: false })
      .order("created_at", { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

    if (activeCategory !== "all") {
      const { data: catRow } = await supabase.from("categories").select("id").eq("slug", activeCategory).single();
      if (catRow) query = query.eq("category_id", catRow.id);
    }
    if (searchQuery) query = query.ilike("title", `%${searchQuery}%`);

    const { data, count, error } = await query;
    if (!error) { setPosts(data || []); setTotalCount(count || 0); }
    setLoading(false);
  }, [activeCategory, page, searchQuery]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleCategory = (slug) => { setActiveCategory(slug); setPage(1); };
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  if (selectedPost) {
    return (
      <BoardPost
        postId={selectedPost}
        supabase={supabase}
        adminPw={ADMIN_PW}
        onBack={() => { setSelectedPost(null); fetchPosts(); }}
      />
    );
  }

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>커뮤니티</h1>
          <p style={s.subtitle}>단위 변환 팁, 질문, 자유로운 이야기를 나눠보세요</p>
        </div>
        <button onClick={() => setShowWrite(v => !v)} style={s.btnPrimary}>
          {showWrite ? "✕ 닫기" : "✏️ 글쓰기"}
        </button>
      </div>

      {showWrite && (
        <WriteForm
          supabase={supabase}
          categories={CATEGORIES.filter(c => c.slug !== "all")}
          onCreated={() => { setShowWrite(false); setPage(1); fetchPosts(); }}
          onCancel={() => setShowWrite(false)}
        />
      )}

      <div style={s.catRow}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.slug}
            onClick={() => handleCategory(cat.slug)}
            style={{ ...s.catBtn, ...(activeCategory === cat.slug ? { background: cat.color, color: "#fff", borderColor: cat.color } : {}) }}
          >
            {cat.icon} {cat.name_ko}
          </button>
        ))}
      </div>

      <div style={s.searchRow}>
        <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { setSearchQuery(searchInput); setPage(1); } }}
          placeholder="제목 검색..." style={s.searchInput} />
        <button onClick={() => { setSearchQuery(searchInput); setPage(1); }} style={s.btnSearch}>검색</button>
        {searchQuery && <button onClick={() => { setSearchQuery(""); setSearchInput(""); setPage(1); }} style={s.btnClear}>✕ 초기화</button>}
        <span style={s.countLabel}>총 {totalCount.toLocaleString()}개</span>
      </div>

      {loading ? (
        <div style={s.emptyBox}>불러오는 중...</div>
      ) : posts.length === 0 ? (
        <div style={s.emptyBox}>게시글이 없습니다. 첫 글을 남겨보세요! 🙌</div>
      ) : (
        <table style={s.table}>
          <colgroup>
            <col style={{ width: 110 }} />
            <col />
            <col style={{ width: 90 }} />
            <col style={{ width: 60 }} />
            <col style={{ width: 60 }} />
            <col style={{ width: 100 }} />
          </colgroup>
          <thead>
            <tr style={s.thead}>
              <th style={{ ...s.th, textAlign: "center" }}>카테고리</th>
              <th style={{ ...s.th, textAlign: "left"   }}>제목</th>
              <th style={{ ...s.th, textAlign: "center" }}>작성자</th>
              <th style={{ ...s.th, textAlign: "center" }}>조회</th>
              <th style={{ ...s.th, textAlign: "center" }}>추천</th>
              <th style={{ ...s.th, textAlign: "center" }}>날짜</th>
            </tr>
          </thead>
          <tbody>
            {posts.map(post => <PostRow key={post.id} post={post} onClick={() => setSelectedPost(post.id)} />)}
          </tbody>
        </table>
      )}

      {totalPages > 1 && (
        <div style={s.pagination}>
          <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1} style={s.pageBtn}>‹</button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            const p = page <= 4 ? i + 1 : page - 3 + i;
            if (p < 1 || p > totalPages) return null;
            return <button key={p} onClick={() => setPage(p)} style={{ ...s.pageBtn, ...(p === page ? s.pageBtnActive : {}) }}>{p}</button>;
          })}
          <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages} style={s.pageBtn}>›</button>
        </div>
      )}
    </div>
  );
}

function PostRow({ post, onClick }) {
  const cat = post.categories;
  const date = new Date(post.created_at);
  const isToday = new Date().toDateString() === date.toDateString();
  const dateStr = isToday
    ? date.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" });
  return (
    <tr style={s.row} onClick={onClick}>
      <td style={{ ...s.td, textAlign: "center" }}>
        {cat && <span style={{ ...s.catBadge, background: cat.color + "22", color: cat.color }}>{cat.icon} {cat.name_ko}</span>}
      </td>
      <td style={s.tdTitle}>
        {post.is_pinned && <span style={s.pinBadge}>📌</span>}
        <span style={s.titleText}>{post.title}</span>
        {post.comment_count > 0 && <span style={s.commentCount}>[{post.comment_count}]</span>}
      </td>
      <td style={{ ...s.td, textAlign: "center", fontSize: 13, color: "#64748b" }}>{post.author_name}</td>
      <td style={{ ...s.td, textAlign: "center", fontSize: 13, color: "#94a3b8" }}>{post.view_count}</td>
      <td style={{ ...s.td, textAlign: "center", fontSize: 13, color: "#f59e0b" }}>{post.like_count > 0 ? `♥ ${post.like_count}` : ""}</td>
      <td style={{ ...s.td, textAlign: "center", fontSize: 12, color: "#94a3b8", whiteSpace: "nowrap" }}>{dateStr}</td>
    </tr>
  );
}

function WriteForm({ supabase, categories, onCreated, onCancel }) {
  const [form, setForm] = useState({ category: "general", title: "", content: "", author_name: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.title.trim())   { setError("제목을 입력해주세요."); return; }
    if (!form.content.trim()) { setError("내용을 입력해주세요."); return; }
    setSubmitting(true); setError("");
    const { data: catRow } = await supabase.from("categories").select("id").eq("slug", form.category).single();
    const { error: err } = await supabase.from("posts").insert({
      category_id: catRow?.id,
      author_name: form.author_name.trim() || "익명",
      title: form.title.trim(),
      content: form.content.trim(),
    });
    if (err) { setError(err.message); setSubmitting(false); return; }
    onCreated();
  };

  return (
    <div style={s.writeBox}>
      <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>새 글 작성</h3>
      <div style={s.formRow}>
        <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={s.select}>
          {categories.map(c => <option key={c.slug} value={c.slug}>{c.icon} {c.name_ko}</option>)}
        </select>
        <input value={form.author_name} onChange={e => setForm(f => ({ ...f, author_name: e.target.value }))}
          placeholder="닉네임 (미입력 시 익명)" style={{ ...s.input, width: 160 }} />
        <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          placeholder="제목" style={{ ...s.input, flex: 1 }} />
      </div>
      <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
        placeholder="내용을 입력하세요..." rows={6} style={s.textarea} />
      {error && <p style={{ color: "#ef4444", fontSize: 13, margin: "4px 0" }}>{error}</p>}
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button onClick={onCancel} style={s.btnSecondary}>취소</button>
        <button onClick={handleSubmit} disabled={submitting} style={s.btnPrimary}>{submitting ? "등록 중..." : "등록"}</button>
      </div>
    </div>
  );
}

const s = {
  wrap:         { width: "100%", padding: "24px 32px", fontFamily: "'Pretendard','Noto Sans KR',sans-serif", color: "#1e293b", boxSizing: "border-box" },
  header:       { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 },
  title:        { margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: "-0.5px" },
  subtitle:     { margin: "4px 0 0", fontSize: 14, color: "#64748b" },
  btnPrimary:   { padding: "8px 18px", borderRadius: 8, border: "none", background: "#6366f1", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 700, whiteSpace: "nowrap" },
  btnSecondary: { padding: "8px 14px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff", color: "#64748b", cursor: "pointer", fontSize: 13, whiteSpace: "nowrap" },
  catRow:       { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  catBtn:       { padding: "6px 14px", borderRadius: 20, border: "1.5px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#475569", transition: "all .15s", whiteSpace: "nowrap" },
  searchRow:    { display: "flex", gap: 8, alignItems: "center", marginBottom: 16, flexWrap: "wrap" },
  searchInput:  { flex: 1, minWidth: 200, padding: "8px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none" },
  btnSearch:    { padding: "8px 16px", borderRadius: 8, border: "none", background: "#334155", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" },
  btnClear:     { padding: "8px 12px", borderRadius: 8, border: "1.5px solid #fca5a5", background: "#fff", color: "#ef4444", cursor: "pointer", fontSize: 13, whiteSpace: "nowrap" },
  countLabel:   { marginLeft: "auto", fontSize: 13, color: "#94a3b8", whiteSpace: "nowrap" },
  table:        { width: "100%", tableLayout: "fixed", borderCollapse: "collapse", background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,.06)" },
  thead:        { background: "#f8fafc" },
  th:           { padding: "12px 12px", fontSize: 13, fontWeight: 700, color: "#64748b", borderBottom: "1.5px solid #e2e8f0", whiteSpace: "nowrap", overflow: "hidden" },
  row:          { cursor: "pointer", borderBottom: "1px solid #f1f5f9", transition: "background .12s" },
  td:           { padding: "14px 12px", fontSize: 14, verticalAlign: "middle", overflow: "hidden", textOverflow: "ellipsis" },
  tdTitle:      { padding: "14px 12px", fontSize: 14, verticalAlign: "middle", overflow: "hidden" },
  titleText:    { color: "#1e293b", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" },
  commentCount: { marginLeft: 6, color: "#6366f1", fontSize: 13, fontWeight: 700 },
  pinBadge:     { marginRight: 6 },
  catBadge:     { display: "inline-block", padding: "3px 8px", borderRadius: 12, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" },
  emptyBox:     { textAlign: "center", padding: "60px 0", color: "#94a3b8", fontSize: 15 },
  pagination:   { display: "flex", justifyContent: "center", gap: 4, marginTop: 24 },
  pageBtn:      { width: 34, height: 34, borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: 14, color: "#475569", display: "flex", alignItems: "center", justifyContent: "center" },
  pageBtnActive:{ background: "#6366f1", color: "#fff", borderColor: "#6366f1", fontWeight: 700 },
  writeBox:     { background: "#f8fafc", borderRadius: 12, padding: "20px", marginBottom: 20, border: "1.5px solid #e2e8f0" },
  formRow:      { display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" },
  select:       { padding: "8px 10px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14, background: "#fff", cursor: "pointer" },
  input:        { padding: "8px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none" },
  textarea:     { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14, resize: "vertical", outline: "none", boxSizing: "border-box", marginBottom: 10 },
};
