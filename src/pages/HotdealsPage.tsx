import Layout from "@/components/Layout";
import HotdealsList from "@/components/HotdealsList";
import TopBanner from "@/components/TopBanner";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSeo, SITE_URL } from "@/lib/seo";

export default function HotdealsPage() {
  const { t } = useLanguage();
  useSeo({
    title: `${t("hotdeals.title")} — Lifetool`,
    description: t("hotdeals.desc"),
    canonical: `${SITE_URL}/hotdeals`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: t("hotdeals.title"),
      description: t("hotdeals.desc"),
      url: `${SITE_URL}/hotdeals`,
    },
  });
  return (
    <Layout title={t("hotdeals.title")} description={t("hotdeals.desc")}>
      <TopBanner slot="hotdeals-top" />
      <HotdealsList />
    </Layout>
  );
}
