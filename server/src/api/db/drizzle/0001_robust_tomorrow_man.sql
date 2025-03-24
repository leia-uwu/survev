ALTER TABLE "ip_logs" ALTER COLUMN "user_id" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "ip_logs" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "ip_logs" ADD COLUMN "region" text NOT NULL;