import { ServingCalc } from "@/components/LifeCalculators";
import ToolPageLayout from "@/components/ToolPageLayout";

export default function LifeCaloriePage() {
  return (
    <ToolPageLayout toolId="life-calorie">
      <ServingCalc />
    </ToolPageLayout>
  );
}
