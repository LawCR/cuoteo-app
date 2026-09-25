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
import type { ExpenseCategory } from "@/generated/prisma/enums";
import { EXPENSE_CATEGORY_CHART_CLASS } from "@/shared/constants/expense-category.constants";
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

interface IExpenseCategoryIconProps {
  category: ExpenseCategory;
  className?: string;
}

export function ExpenseCategoryIcon({
  category,
  className,
}: IExpenseCategoryIconProps): ReactElement {
  const Icon = CATEGORY_ICONS[category];

  return (
    <Icon
      className={cn("size-4", EXPENSE_CATEGORY_CHART_CLASS[category], className)}
      aria-hidden
    />
  );
}
