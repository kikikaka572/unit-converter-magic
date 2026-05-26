import Layout from "@/components/Layout";
import FrSalaryCalculator from "@/components/FrSalaryCalculator";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSeo, SITE_URL } from "@/lib/seo";

export default function FrSalaryPage() {
  const { t } = useLanguage();
  useSeo({
    title: "Simulateur salaire net France 2026 — Lifetool",
    description: t("header.frsalary.desc"),
    canonical: `${SITE_URL}/fr-salary`,
  });
  return (
    <Layout title={t("header.frsalary.title")} description={t("header.frsalary.desc")}>
      <FrSalaryCalculator />
    </Layout>
  );
}
