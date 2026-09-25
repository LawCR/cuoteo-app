-- CreateTable
CREATE TABLE "expenses" (
    "id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "category" "expense_category" NOT NULL,
    "paid_by_member_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense_shares" (
    "id" TEXT NOT NULL,
    "expense_id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "share_amount" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expense_shares_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "expenses_plan_id_idx" ON "expenses"("plan_id");

-- CreateIndex
CREATE UNIQUE INDEX "expense_shares_expense_id_member_id_key" ON "expense_shares"("expense_id", "member_id");

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_paid_by_member_id_fkey" FOREIGN KEY ("paid_by_member_id") REFERENCES "plan_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_shares" ADD CONSTRAINT "expense_shares_expense_id_fkey" FOREIGN KEY ("expense_id") REFERENCES "expenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_shares" ADD CONSTRAINT "expense_shares_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "plan_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
