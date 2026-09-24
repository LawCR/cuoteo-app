-- CreateEnum
CREATE TYPE "plan_phase" AS ENUM ('ACTIVE', 'BALANCE', 'COMPLETED');

-- CreateEnum
CREATE TYPE "expense_category" AS ENUM ('FOOD', 'TRANSPORT', 'LODGING', 'ENTERTAINMENT', 'SHOPPING', 'HEALTH', 'SERVICES', 'OTHER');

-- CreateTable
CREATE TABLE "plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" "expense_category" NOT NULL,
    "phase" "plan_phase" NOT NULL DEFAULT 'ACTIVE',
    "creator_user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_members" (
    "id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "user_id" TEXT,
    "ghost_name" TEXT,
    "ghost_name_normalized" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "plans_creator_user_id_idx" ON "plans"("creator_user_id");

-- CreateIndex
CREATE INDEX "plans_phase_idx" ON "plans"("phase");

-- CreateIndex
CREATE INDEX "plans_created_at_idx" ON "plans"("created_at");

-- CreateIndex
CREATE INDEX "plan_members_plan_id_idx" ON "plan_members"("plan_id");

-- CreateIndex
CREATE INDEX "plan_members_user_id_idx" ON "plan_members"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "plan_members_plan_id_user_id_key" ON "plan_members"("plan_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "plan_members_plan_id_ghost_name_normalized_key" ON "plan_members"("plan_id", "ghost_name_normalized");

-- AddForeignKey
ALTER TABLE "plans" ADD CONSTRAINT "plans_creator_user_id_fkey" FOREIGN KEY ("creator_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_members" ADD CONSTRAINT "plan_members_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_members" ADD CONSTRAINT "plan_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
