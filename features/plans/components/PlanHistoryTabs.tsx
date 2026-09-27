"use client";

import type { ReactElement, ReactNode } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";

interface IPlanHistoryTabsProps {
  defaultTab: "settlement" | "expenses";
  settlementLabel: string;
  expensesLabel: string;
  settlementPanel: ReactNode;
  expensesPanel: ReactNode;
}

export function PlanHistoryTabs({
  defaultTab,
  settlementLabel,
  expensesLabel,
  settlementPanel,
  expensesPanel,
}: IPlanHistoryTabsProps): ReactElement {
  return (
    <Tabs defaultValue={defaultTab} className="w-full max-w-4xl gap-4">
      <TabsList className="grid h-auto min-h-11 w-full grid-cols-2">
        <TabsTrigger value="settlement" className="min-h-11 px-3">
          {settlementLabel}
        </TabsTrigger>
        <TabsTrigger value="expenses" className="min-h-11 px-3">
          {expensesLabel}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="settlement" className="flex flex-col gap-6">
        {settlementPanel}
      </TabsContent>
      <TabsContent value="expenses" className="flex flex-col gap-6">
        {expensesPanel}
      </TabsContent>
    </Tabs>
  );
}
