import Layout from "@/components/Layout";
import UnitConverter from "@/components/UnitConverter";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSeo, SITE_URL } from "@/lib/seo";

export default function ConverterPage() {
  const { t } = useLanguage();
  useSeo({
    title: `${t("header.converter.title")} — Lifetool`,
    description: t("header.converter.desc"),
    canonical: `${SITE_URL}/converter`,
  });
  return (
    <Layout title={t("header.converter.title")} description={t("header.converter.desc")}>
      <UnitConverter />
    </Layout>
  );
}
