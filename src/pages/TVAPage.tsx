import Layout from "@/components/Layout";
import TVACalculator from "@/components/TVACalculator";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSeo, SITE_URL } from "@/lib/seo";

export default function TVAPage() {
  const { t } = useLanguage();
  useSeo({
    title: `${t("header.tva.title")} — Lifetool`,
    description: t("header.tva.desc"),
    canonical: `${SITE_URL}/tva`,
  });
  return (
    <Layout title={t("header.tva.title")} description={t("header.tva.desc")}>
      <TVACalculator />
    </Layout>
  );
}
