import { DdayCalc } from "@/components/LifeCalculators";
import ToolPageLayout from "@/components/ToolPageLayout";

export default function LifeDdayPage() {
  return (
    <ToolPageLayout toolId="life-dday">
      <DdayCalc />
    </ToolPageLayout>
  );
}
