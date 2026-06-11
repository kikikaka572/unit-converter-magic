import LifeCalculators from "@/components/LifeCalculators";
import ToolPageLayout from "@/components/ToolPageLayout";

export default function LifePage() {
  return (
    <ToolPageLayout toolId="life">
      <LifeCalculators />
    </ToolPageLayout>
  );
}
