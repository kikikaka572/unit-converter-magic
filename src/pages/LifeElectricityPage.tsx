import { ElectricityCalc } from "@/components/LifeCalculators";
import ToolPageLayout from "@/components/ToolPageLayout";

export default function LifeElectricityPage() {
  return (
    <ToolPageLayout toolId="life-electricity">
      <ElectricityCalc />
    </ToolPageLayout>
  );
}
