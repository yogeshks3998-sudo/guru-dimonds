DROP INDEX IF EXISTS "public"."PendingRegistration_email_key";

CREATE UNIQUE INDEX IF NOT EXISTS "PendingRegistration_phone_key" ON "public"."PendingRegistration"("phone");
CREATE INDEX IF NOT EXISTS "PendingRegistration_email_idx" ON "public"."PendingRegistration"("email");
