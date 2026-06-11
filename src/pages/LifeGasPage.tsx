import { GasCalc } from "@/components/LifeCalculators";
import ToolPageLayout from "@/components/ToolPageLayout";

export default function LifeGasPage() {
  return (
    <ToolPageLayout toolId="life-gas">
      <GasCalc />
    </ToolPageLayout>
  );
}
