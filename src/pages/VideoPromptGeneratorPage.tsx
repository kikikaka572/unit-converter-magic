import VideoPromptGenerator from "@/components/VideoPromptGenerator";
import ToolPageLayout from "@/components/ToolPageLayout";

export default function VideoPromptGeneratorPage() {
  return (
    <ToolPageLayout toolId="video-prompt">
      <VideoPromptGenerator />
    </ToolPageLayout>
  );
}
