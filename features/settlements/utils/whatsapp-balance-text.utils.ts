import type {
  IWhatsAppBalanceMember,
  IWhatsAppBalanceTextInput,
  IWhatsAppBalanceTransfer,
} from "@/features/settlements/interfaces/whatsapp-balance-text.interface";
import { formatPen } from "@/shared/utils/money.utils";

const APP_NAME = "Cuoteo";

function formatMemberLine(member: IWhatsAppBalanceMember): string {
  if (member.role === "creditor") {
    return `• ${member.name}: a favor ${formatPen(member.remaining)}`;
  }

  if (member.role === "debtor") {
    return `• ${member.name}: debe ${formatPen(Math.abs(member.remaining))}`;
  }

  return `• ${member.name}: al día`;
}

function formatTransferLine(transfer: IWhatsAppBalanceTransfer): string {
  return `• ${transfer.fromName} le paga a ${transfer.toName} ${formatPen(transfer.amount)}`;
}

export function buildWhatsAppBalanceText(
  input: IWhatsAppBalanceTextInput,
): string {
  const lines = [
    `${APP_NAME} — ${input.planName}`,
    "",
    "Saldos:",
    ...input.members.map(formatMemberLine),
  ];

  if (input.transfers.length > 0) {
    lines.push("", "Cómo saldar:", ...input.transfers.map(formatTransferLine));
  }

  lines.push(
    "",
    "Abre el plan (necesitas iniciar sesión):",
    input.planUrl,
  );

  return lines.join("\n");
}
