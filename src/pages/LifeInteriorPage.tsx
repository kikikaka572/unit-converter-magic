import { InteriorCalc } from "@/components/LifeCalculators";
import ToolPageLayout from "@/components/ToolPageLayout";

export default function LifeInteriorPage() {
  return (
    <ToolPageLayout toolId="life-interior">
      <InteriorCalc />
    </ToolPageLayout>
  );
}
