import Layout from "@/components/Layout";
import SizeConverter from "@/components/SizeConverter";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSeo, SITE_URL } from "@/lib/seo";

export default function SizePage() {
  const { t } = useLanguage();
  useSeo({
    title: `${t("header.size.title")} — Lifetool`,
    description: t("header.size.desc"),
    canonical: `${SITE_URL}/size`,
  });
  return (
    <Layout title={t("header.size.title")} description={t("header.size.desc")}>
      <SizeConverter />
    </Layout>
  );
}
