import Layout from "@/components/Layout";
import SalaryCalculator from "@/components/SalaryCalculator";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSeo, SITE_URL } from "@/lib/seo";

export default function SalaryPage() {
  const { t } = useLanguage();
  useSeo({
    title: `${t("header.salary.title")} — Lifetool`,
    description: t("header.salary.desc"),
    canonical: `${SITE_URL}/salary`,
  });
  return (
    <Layout title={t("header.salary.title")} description={t("header.salary.desc")}>
      <SalaryCalculator />
    </Layout>
  );
}
