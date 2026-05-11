import Layout from "@/components/Layout";
import Board from "@/components/Board";
import TopBanner from "@/components/TopBanner";

export default function CommunityPage() {
  return (
    <Layout>
      <TopBanner slot="community-top" />
      <Board />
    </Layout>
  );
}
