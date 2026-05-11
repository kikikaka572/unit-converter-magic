import { useEffect, useMemo, useState } from "react";
import { ExternalLink, RefreshCw } from "lucide-react";
import {
  loadCommunityHot,
  clearCommunityHotCache,
  SOURCE_LABEL,
  type CommunityHotPost,
} from "@/lib/communityHot";

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "방금 전";
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

export default function CommunityHotList() {
  const [posts, setPosts] = useState<CommunityHotPost[] | null>(null);
  const [source, setSource] = useState<string>("all");
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    setRefreshing(true);
    try {
      clearCommunityHotCache();
      const { posts: data } = await loadCommunityHot();
      setPosts(data);
    } catch {
      setPosts([]);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const sources = useMemo(() => {
    if (!posts) return [];
    return Array.from(new Set(posts.map((p) => p.source)));
  }, [posts]);

  const filtered = useMemo(() => {
    if (!posts) return [];
    return source === "all" ? posts : posts.filter((p) => p.source === source);
  }, [posts, source]);

  if (posts === null) {
    return <p className="text-center text-muted-foreground py-12">불러오는 중...</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setSource("all")}
          className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
            source === "all"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-muted-foreground border-border hover:text-foreground"
          }`}
        >
          전체
        </button>
        {sources.map((s) => (
          <button
            key={s}
            onClick={() => setSource(s)}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
              source === s
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            {SOURCE_LABEL[s] ?? s}
          </button>
        ))}
        <button
          onClick={load}
          disabled={refreshing}
          className="ml-auto inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border border-border bg-card text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`} />
          새로고침
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          게시글이 아직 없습니다. 잠시 후 자동으로 채워집니다.
        </p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((post) => (
            <li
              key={post.id}
              className="flex gap-3 p-3 rounded-xl border border-border bg-card hover:shadow-md transition-shadow"
            >
              <div className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-secondary flex items-center justify-center">
                {post.thumbnail_url ? (
                  <img
                    src={post.thumbnail_url}
                    alt={post.title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl">💬</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <h3 className="text-sm sm:text-base font-semibold text-foreground line-clamp-2 leading-snug">
                    {post.title}
                  </h3>
                </a>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground flex-wrap">
                  <span className="font-medium">{SOURCE_LABEL[post.source] ?? post.source}</span>
                  {post.author && (<><span>·</span><span>{post.author}</span></>)}
                  <span>·</span>
                  <span>{timeAgo(post.posted_at)}</span>
                </div>
                <div className="mt-2">
                  <a
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90"
                  >
                    <ExternalLink className="w-3 h-3" />
                    원본 보기
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
