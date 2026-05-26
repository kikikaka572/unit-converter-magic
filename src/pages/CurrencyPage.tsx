import Layout from "@/components/Layout";
import CurrencyConverter from "@/components/CurrencyConverter";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSeo, SITE_URL } from "@/lib/seo";

export default function CurrencyPage() {
  const { t } = useLanguage();
  useSeo({
    title: `${t("header.currency.title")} — Lifetool`,
    description: t("header.currency.desc"),
    canonical: `${SITE_URL}/currency`,
  });
  return (
    <Layout title={t("header.currency.title")} description={t("header.currency.desc")}>
      <CurrencyConverter />
    </Layout>
  );
}
