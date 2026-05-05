import Layout from "@/components/Layout";
import LifeCalculators from "@/components/LifeCalculators";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSeo, SITE_URL } from "@/lib/seo";

export default function LifePage() {
  const { t } = useLanguage();
  useSeo({
    title: `${t("header.life.title")} — Lifetool`,
    description: t("header.life.desc"),
    canonical: `${SITE_URL}/life`,
  });
  return (
    <Layout title={t("header.life.title")} description={t("header.life.desc")}>
      <LifeCalculators />
    </Layout>
  );
}
