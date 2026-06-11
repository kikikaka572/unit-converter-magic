import PromptGenerator from "@/components/PromptGenerator";
import ToolPageLayout from "@/components/ToolPageLayout";

export default function PromptGeneratorPage() {
  return (
    <ToolPageLayout toolId="prompt-generator">
      <PromptGenerator />
    </ToolPageLayout>
  );
}
