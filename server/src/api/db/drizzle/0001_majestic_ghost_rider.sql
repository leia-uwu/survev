DROP INDEX `idx_match_data_team_query` ON `match_data`;--> statement-breakpoint
CREATE INDEX `idx_user_id` ON `match_data` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_match_data_team_query` ON `match_data` (`team_mode`,`map_id`,`created_at`,`game_id`,`team_id`,`region`,`kills`);--> statement-breakpoint
ALTER TABLE `match_data` DROP COLUMN `slug`;