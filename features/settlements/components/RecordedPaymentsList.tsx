import type { ReactElement } from "react";
import { VoidPaymentButton } from "@/features/settlements/components/VoidPaymentButton";
import type { IRecordedPaymentView } from "@/features/settlements/interfaces/settlement.interface";
import { MoneyText } from "@/shared/components/MoneyText";
import { formatLimaDate } from "@/shared/utils/lima-date.utils";

interface IRecordedPaymentsListProps {
  planId: string;
  payments: IRecordedPaymentView[];
  canVoid: boolean;
}

export function RecordedPaymentsList({
  planId,
  payments,
  canVoid,
}: IRecordedPaymentsListProps): ReactElement {
  if (payments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Todavía no hay pagos registrados.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {payments.map((payment) => (
        <li
          key={payment.id}
          className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border px-3 py-3"
        >
          <div className="flex min-w-0 flex-col gap-1">
            <p className="text-sm">
              <span className="font-medium">{payment.fromName}</span>
              {" pagó a "}
              <span className="font-medium">{payment.toName}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              {formatLimaDate(payment.createdAt)}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <MoneyText amount={payment.amount} className="shrink-0 text-sm" />
            {canVoid ? (
              <VoidPaymentButton
                planId={planId}
                paymentId={payment.id}
                fromName={payment.fromName}
                toName={payment.toName}
              />
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
