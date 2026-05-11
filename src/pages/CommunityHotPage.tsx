import Layout from "@/components/Layout";
import CommunityHotList from "@/components/CommunityHotList";
import TopBanner from "@/components/TopBanner";

export default function CommunityHotPage() {
  return (
    <Layout
      title="🔥 커뮤니티 핫글"
      description="클리앙 · 오늘의유머 · Reddit 인기 글을 한 곳에서"
    >
      <TopBanner slot="community-hot-top" />
      <CommunityHotList />
    </Layout>
  );
}
