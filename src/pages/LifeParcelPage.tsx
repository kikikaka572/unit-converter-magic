import { ParcelCalc } from "@/components/LifeCalculators";
import ToolPageLayout from "@/components/ToolPageLayout";

export default function LifeParcelPage() {
  return (
    <ToolPageLayout toolId="life-parcel">
      <ParcelCalc />
    </ToolPageLayout>
  );
}
