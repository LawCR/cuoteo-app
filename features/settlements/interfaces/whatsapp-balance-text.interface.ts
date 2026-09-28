import type { TMemberBalanceRole } from "@/features/settlements/interfaces/remaining-balance.interface";

export interface IWhatsAppBalanceMember {
  name: string;
  remaining: number;
  role: TMemberBalanceRole;
}

export interface IWhatsAppBalanceTransfer {
  fromName: string;
  toName: string;
  amount: number;
}

export interface IWhatsAppBalanceTextInput {
  planName: string;
  planUrl: string;
  members: readonly IWhatsAppBalanceMember[];
  transfers: readonly IWhatsAppBalanceTransfer[];
}
