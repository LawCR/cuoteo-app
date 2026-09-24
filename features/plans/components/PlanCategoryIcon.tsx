import type { LucideIcon } from "lucide-react";
import {
  BedDoubleIcon,
  BusIcon,
  EllipsisIcon,
  HeartPulseIcon,
  PartyPopperIcon,
  ShoppingBagIcon,
  UtensilsCrossedIcon,
  WrenchIcon,
} from "lucide-react";
import type { ReactElement } from "react";
import { EXPENSE_CATEGORY_CHART_CLASS } from "@/features/plans/constants/plans.constants";
import type { ExpenseCategory } from "@/generated/prisma/enums";
import { cn } from "@/shared/utils/cn.utils";

const CATEGORY_ICONS: Record<ExpenseCategory, LucideIcon> = {
  FOOD: UtensilsCrossedIcon,
  TRANSPORT: BusIcon,
  LODGING: BedDoubleIcon,
  ENTERTAINMENT: PartyPopperIcon,
  SHOPPING: ShoppingBagIcon,
  HEALTH: HeartPulseIcon,
  SERVICES: WrenchIcon,
  OTHER: EllipsisIcon,
};

interface IPlanCategoryIconProps {
  category: ExpenseCategory;
  className?: string;
}

export function PlanCategoryIcon({
  category,
  className,
}: IPlanCategoryIconProps): ReactElement {
  const Icon = CATEGORY_ICONS[category];

  return (
    <Icon
      className={cn("size-4", EXPENSE_CATEGORY_CHART_CLASS[category], className)}
      aria-hidden
    />
  );
}
