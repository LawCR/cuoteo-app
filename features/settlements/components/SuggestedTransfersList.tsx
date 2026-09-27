import type { ReactElement } from "react";
import type { ISuggestedTransferView } from "@/features/settlements/interfaces/settlement.interface";
import { MoneyText } from "@/shared/components/MoneyText";

interface ISuggestedTransfersListProps {
  transfers: ISuggestedTransferView[];
}

export function SuggestedTransfersList({
  transfers,
}: ISuggestedTransfersListProps): ReactElement {
  if (transfers.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nadie se debe nada. No hay transferencias pendientes.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {transfers.map((transfer) => (
        <li
          key={`${transfer.fromMemberId}-${transfer.toMemberId}-${transfer.amount}`}
          className="flex items-start justify-between gap-3 rounded-md border border-border px-3 py-3"
        >
          <p className="text-sm">
            <span className="font-medium">{transfer.fromName}</span>
            {" le paga a "}
            <span className="font-medium">{transfer.toName}</span>
          </p>
          <MoneyText amount={transfer.amount} className="shrink-0 text-sm" />
        </li>
      ))}
    </ul>
  );
}
