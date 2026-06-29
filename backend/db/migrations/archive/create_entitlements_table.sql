-- Create entitlements table for package purchases
CREATE TABLE IF NOT EXISTS "entitlements" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "purchased_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "transaction_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "entitlements_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint for user-category-level combination
CREATE UNIQUE INDEX IF NOT EXISTS "entitlements_userId_category_level_key" ON "entitlements"("user_id", "category", "level");

-- Create foreign key constraint
ALTER TABLE "entitlements" ADD CONSTRAINT "entitlements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create indexes for faster queries
-- NOTE: Using idx_ prefix to match Prisma naming convention
-- This prevents duplicate indexes when Prisma migrations run
CREATE INDEX IF NOT EXISTS "idx_entitlements_user_id" ON "entitlements"("user_id");
CREATE INDEX IF NOT EXISTS "idx_entitlements_category" ON "entitlements"("category");
CREATE INDEX IF NOT EXISTS "idx_entitlements_level" ON "entitlements"("level");
CREATE INDEX IF NOT EXISTS "idx_entitlements_is_active" ON "entitlements"("is_active");
