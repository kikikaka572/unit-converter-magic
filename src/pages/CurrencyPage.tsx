import CurrencyConverter from "@/components/CurrencyConverter";
import ToolPageLayout from "@/components/ToolPageLayout";

export default function CurrencyPage() {
  return (
    <ToolPageLayout toolId="currency">
      <CurrencyConverter />
    </ToolPageLayout>
  );
}
