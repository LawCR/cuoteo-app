import type { ReactElement } from "react";
import {
  MEMBER_CHART_STROKE_CLASSES,
  MEMBER_CHART_SWATCH_CLASSES,
} from "@/features/expenses/constants/expenses.constants";
import type {
  IMemberShareBreakdown,
  IMemberShareSlice,
} from "@/features/expenses/interfaces/expense.interface";
import { cn } from "@/shared/utils/cn.utils";
import { formatPen } from "@/shared/utils/money.utils";

const DONUT_RADIUS = 34;
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;

interface IExpenseShareChartProps {
  breakdown: IMemberShareBreakdown;
}

interface IDonutSegment extends IMemberShareSlice {
  dash: number;
  offset: number;
}

function toDonutSegments(
  slices: readonly IMemberShareSlice[],
  total: number,
): IDonutSegment[] {
  let offset = 0;

  return slices
    .filter((slice) => slice.amount > 0)
    .map((slice) => {
      const dash = (slice.amount / total) * DONUT_CIRCUMFERENCE;
      const segment = { ...slice, dash, offset };
      offset += dash;
      return segment;
    });
}

export function ExpenseShareChart({
  breakdown,
}: IExpenseShareChartProps): ReactElement {
  const segments = toDonutSegments(breakdown.slices, breakdown.total);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative mx-auto size-48 shrink-0 sm:mx-0">
        <svg
          viewBox="0 0 100 100"
          className="size-full -rotate-90"
          role="img"
          aria-label={`Reparto del total ${formatPen(breakdown.total)}`}
        >
          {segments.length === 0 ? (
            <circle
              cx="50"
              cy="50"
              r={DONUT_RADIUS}
              fill="none"
              className="stroke-muted"
              strokeWidth="14"
            />
          ) : (
            segments.map((segment) => (
              <circle
                key={segment.memberId}
                cx="50"
                cy="50"
                r={DONUT_RADIUS}
                fill="none"
                className={MEMBER_CHART_STROKE_CLASSES[segment.chartIndex]}
                strokeWidth="14"
                strokeDasharray={`${segment.dash} ${DONUT_CIRCUMFERENCE - segment.dash}`}
                strokeDashoffset={-segment.offset}
              />
            ))
          )}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-sm font-medium tabular-nums">
            {formatPen(breakdown.total)}
          </p>
        </div>
      </div>
      <ul className="flex min-w-0 flex-1 flex-col gap-2">
        {breakdown.slices.map((slice) => (
          <li
            key={slice.memberId}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span
                className={cn(
                  "size-2.5 shrink-0 rounded-full",
                  MEMBER_CHART_SWATCH_CLASSES[slice.chartIndex],
                )}
                aria-hidden
              />
              <span className="truncate">{slice.name}</span>
            </span>
            <span className="shrink-0 tabular-nums text-muted-foreground">
              {formatPen(slice.amount)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
