import { MovingCalc } from "@/components/LifeCalculators";
import ToolPageLayout from "@/components/ToolPageLayout";

export default function LifeMovingPage() {
  return (
    <ToolPageLayout toolId="life-moving">
      <MovingCalc />
    </ToolPageLayout>
  );
}
