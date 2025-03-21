ALTER TABLE "banned_ips" ALTER COLUMN "created_at" SET DEFAULT timezone('utc', now());--> statement-breakpoint
ALTER TABLE "ip_logs" ALTER COLUMN "created_at" SET DEFAULT timezone('utc', now());--> statement-breakpoint
ALTER TABLE "match_data" ALTER COLUMN "created_at" SET DEFAULT timezone('utc', now());--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "user_created" SET DEFAULT timezone('utc', now());