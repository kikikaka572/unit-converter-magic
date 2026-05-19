import Layout from "@/components/Layout";
import VideoPromptGenerator from "@/components/VideoPromptGenerator";
import { useLanguage } from "@/i18n/LanguageContext";
import { useSeo, SITE_URL } from "@/lib/seo";

export default function VideoPromptGeneratorPage() {
  const { t } = useLanguage();
  useSeo({
    title: `${t("header.videoprompt.title")} — Lifetool`,
    description: t("header.videoprompt.desc"),
    canonical: `${SITE_URL}/video-prompt`,
  });
  return (
    <Layout title={t("header.videoprompt.title")} description={t("header.videoprompt.desc")}>
      <VideoPromptGenerator />
    </Layout>
  );
}
