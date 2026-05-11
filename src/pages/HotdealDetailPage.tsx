import Layout from "@/components/Layout";
import HotdealDetail from "@/components/HotdealDetail";
import TopBanner from "@/components/TopBanner";

export default function HotdealDetailPage() {
  return (
    <Layout>
      <TopBanner slot="hotdeal-detail-top" />
      <HotdealDetail />
    </Layout>
  );
}
