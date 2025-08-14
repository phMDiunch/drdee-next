-- Safe additive migration for TreatmentCare (Aftercare)
-- This script only creates the enum, ensures required extension, creates the table, indexes, and FKs.
-- It will not drop or alter existing data.

-- 1) Ensure pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2) Enum type for care status
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TreatmentCareStatus') THEN
    CREATE TYPE "TreatmentCareStatus" AS ENUM ('STABLE','UNREACHABLE','NEEDS_FOLLOW_UP');
  END IF;
END$$;

-- 3) Create table TreatmentCare if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'TreatmentCare'
  ) THEN
    CREATE TABLE "TreatmentCare" (
      "id" TEXT PRIMARY KEY DEFAULT (gen_random_uuid())::text,

      -- Relations
  "customerId" TEXT NOT NULL,
  "clinicId" TEXT NOT NULL,
  "careStaffId" TEXT NOT NULL,

      -- Business dates
      "treatmentDate" DATE NOT NULL,
      "careAt" TIMESTAMPTZ NOT NULL,

      -- Content & Status
      "careContent" TEXT NOT NULL,
      "careStatus" "TreatmentCareStatus" NOT NULL,

      -- Snapshots
      "treatmentServiceNames" TEXT[] NOT NULL DEFAULT '{}',
      "treatingDoctorNames"   TEXT[] NOT NULL DEFAULT '{}',
      "treatingDoctorIds"     TEXT[] NOT NULL DEFAULT '{}',
      "treatmentClinicIds"    TEXT[] NOT NULL DEFAULT '{}',

      -- Audit
  "createdById" TEXT NOT NULL,
  "updatedById" TEXT NOT NULL,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- Foreign keys
    ALTER TABLE "TreatmentCare"
      ADD CONSTRAINT "TreatmentCare_customerId_fkey"
      FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

    ALTER TABLE "TreatmentCare"
      ADD CONSTRAINT "TreatmentCare_careStaffId_fkey"
      FOREIGN KEY ("careStaffId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

    ALTER TABLE "TreatmentCare"
      ADD CONSTRAINT "TreatmentCare_createdById_fkey"
      FOREIGN KEY ("createdById") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

    ALTER TABLE "TreatmentCare"
      ADD CONSTRAINT "TreatmentCare_updatedById_fkey"
      FOREIGN KEY ("updatedById") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

    -- Indexes
    CREATE INDEX IF NOT EXISTS "TreatmentCare_clinicId_treatmentDate_idx"
      ON "TreatmentCare" ("clinicId", "treatmentDate");
    CREATE INDEX IF NOT EXISTS "TreatmentCare_clinicId_careAt_idx"
      ON "TreatmentCare" ("clinicId", "careAt");
    CREATE INDEX IF NOT EXISTS "TreatmentCare_careStaffId_careAt_idx"
      ON "TreatmentCare" ("careStaffId", "careAt");
    CREATE INDEX IF NOT EXISTS "TreatmentCare_customerId_treatmentDate_idx"
      ON "TreatmentCare" ("customerId", "treatmentDate");
  END IF;
END$$;
