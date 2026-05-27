import Layout from "@/components/Layout";
import ScreenRuler from "@/components/ScreenRuler";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSeo, SITE_URL } from "@/lib/seo";

export default function RulerPage() {
  const { t } = useLanguage();
  useSeo({
    title: `${t("header.ruler.title")} — Lifetool`,
    description: t("header.ruler.desc"),
    canonical: `${SITE_URL}/ruler`,
  });
  return (
    <Layout title={t("header.ruler.title")} description={t("header.ruler.desc")}>
      <ScreenRuler />
    </Layout>
  );
}
