import SalaryCalculator from "@/components/SalaryCalculator";
import ToolPageLayout from "@/components/ToolPageLayout";

export default function SalaryPage() {
  return (
    <ToolPageLayout toolId="salary">
      <SalaryCalculator />
    </ToolPageLayout>
  );
}
