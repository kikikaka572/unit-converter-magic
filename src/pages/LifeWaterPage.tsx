import { WaterCalc } from "@/components/LifeCalculators";
import ToolPageLayout from "@/components/ToolPageLayout";

export default function LifeWaterPage() {
  return (
    <ToolPageLayout toolId="life-water">
      <WaterCalc />
    </ToolPageLayout>
  );
}
