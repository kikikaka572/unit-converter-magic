import { FuelCalc } from "@/components/LifeCalculators";
import ToolPageLayout from "@/components/ToolPageLayout";

export default function LifeFuelPage() {
  return (
    <ToolPageLayout toolId="life-fuel">
      <FuelCalc />
    </ToolPageLayout>
  );
}
