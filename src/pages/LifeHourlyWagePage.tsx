import { SalaryCalc } from "@/components/LifeCalculators";
import ToolPageLayout from "@/components/ToolPageLayout";

export default function LifeHourlyWagePage() {
  return (
    <ToolPageLayout toolId="life-hourly-wage">
      <SalaryCalc />
    </ToolPageLayout>
  );
}
