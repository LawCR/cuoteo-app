import type { ReactElement } from "react";
import { RecordedPaymentsList } from "@/features/settlements/components/RecordedPaymentsList";
import { SuggestedTransfersList } from "@/features/settlements/components/SuggestedTransfersList";
import type {
  IRecordedPaymentView,
  ISuggestedTransferView,
} from "@/features/settlements/interfaces/settlement.interface";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

interface ISettlementBalanceSectionProps {
  planId: string;
  transfers: ISuggestedTransferView[];
  payments: IRecordedPaymentView[];
  canVoidPayments: boolean;
}

export function SettlementBalanceSection({
  planId,
  transfers,
  payments,
  canVoidPayments,
}: ISettlementBalanceSectionProps): ReactElement {
  return (
    <>
      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Transferencias mínimas</CardTitle>
          <CardDescription>
            Una forma de saldar el plan con la menor cantidad de pagos. Se
            actualiza cada vez que registras o anulas un pago.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SuggestedTransfersList transfers={transfers} />
        </CardContent>
      </Card>
      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Pagos registrados</CardTitle>
          <CardDescription>
            Cualquier integrante con cuenta puede anular un pago mientras el
            plan esté en balance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecordedPaymentsList
            planId={planId}
            payments={payments}
            canVoid={canVoidPayments}
          />
        </CardContent>
      </Card>
    </>
  );
}
