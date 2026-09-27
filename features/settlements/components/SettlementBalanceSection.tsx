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
  showSuggestedTransfers: boolean;
}

export function SettlementBalanceSection({
  planId,
  transfers,
  payments,
  canVoidPayments,
  showSuggestedTransfers,
}: ISettlementBalanceSectionProps): ReactElement {
  return (
    <>
      {showSuggestedTransfers ? (
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
      ) : null}
      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Historial de pagos</CardTitle>
          <CardDescription>
            {canVoidPayments
              ? "Cualquier integrante con cuenta puede anular un pago mientras el plan esté en balance."
              : "Consulta los pagos de este plan. En Completado no se puede anular ni registrar."}
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
