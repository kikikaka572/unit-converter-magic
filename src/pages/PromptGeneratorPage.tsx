import Layout from "@/components/Layout";
import PromptGenerator from "@/components/PromptGenerator";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSeo, SITE_URL } from "@/lib/seo";

export default function PromptGeneratorPage() {
  const { t } = useLanguage();
  useSeo({
    title: `${t("header.prompt.title")} — Lifetool`,
    description: t("header.prompt.desc"),
    canonical: `${SITE_URL}/prompt-generator`,
  });
  return (
    <Layout title={t("header.prompt.title")} description={t("header.prompt.desc")}>
      <PromptGenerator />
    </Layout>
  );
}
