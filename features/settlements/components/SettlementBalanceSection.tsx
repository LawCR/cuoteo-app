import type { ReactElement } from "react";
import { SuggestedTransfersList } from "@/features/settlements/components/SuggestedTransfersList";
import type { ISuggestedTransferView } from "@/features/settlements/interfaces/settlement.interface";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

interface ISettlementBalanceSectionProps {
  transfers: ISuggestedTransferView[];
}

export function SettlementBalanceSection({
  transfers,
}: ISettlementBalanceSectionProps): ReactElement {
  return (
    <Card className="max-w-4xl">
      <CardHeader>
        <CardTitle>Transferencias mínimas</CardTitle>
        <CardDescription>
          Una forma de saldar el plan con la menor cantidad de pagos. Se
          actualiza cada vez que registras un pago.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SuggestedTransfersList transfers={transfers} />
      </CardContent>
    </Card>
  );
}
