CREATE TABLE `banned_ips` (
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`expries_in` timestamp NOT NULL,
	`encoded_ip` varchar(255) NOT NULL,
	CONSTRAINT `banned_ips_encoded_ip` PRIMARY KEY(`encoded_ip`)
);
--> statement-breakpoint
CREATE TABLE `ip_logs` (
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`real_ip` varchar(255) NOT NULL,
	`encoded_ip` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`game_id` varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `match_data` (
	`user_id` varchar(255) DEFAULT '',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`region` varchar(255) NOT NULL,
	`map_id` int NOT NULL,
	`game_id` varchar(255) NOT NULL,
	`slug` varchar(255),
	`username` varchar(255) NOT NULL,
	`player_id` int NOT NULL,
	`team_mode` int NOT NULL,
	`team_count` int NOT NULL,
	`team_total` int NOT NULL,
	`team_id` int NOT NULL,
	`time_alive` int NOT NULL,
	`rank` int NOT NULL,
	`died` boolean NOT NULL,
	`kills` int NOT NULL,
	`damage_dealt` int NOT NULL,
	`damage_taken` int NOT NULL,
	`killer_id` int NOT NULL,
	`killed_ids` json NOT NULL
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`expires_at` datetime NOT NULL,
	CONSTRAINT `session_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(255) NOT NULL,
	`auth_id` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`banned` boolean NOT NULL DEFAULT false,
	`ban_reason` varchar(255) NOT NULL DEFAULT '',
	`username` varchar(255) NOT NULL DEFAULT '',
	`username_set` boolean NOT NULL DEFAULT false,
	`user_created` timestamp NOT NULL DEFAULT (now()),
	`last_username_change_time` timestamp,
	`linked` boolean NOT NULL DEFAULT false,
	`linked_google` boolean NOT NULL DEFAULT false,
	`linked_discord` boolean NOT NULL DEFAULT false,
	`loadout` json NOT NULL DEFAULT ('{"outfit":"outfitBase","melee":"fists","heal":"heal_basic","boost":"boost_basic","player_icon":"","crosshair":{"type":"crosshair_default","color":16777215,"size":"1.00","stroke":"0.00"},"emotes":["emote_happyface","emote_thumbsup","emote_surviv","emote_sadface","",""]}'),
	`items` json NOT NULL DEFAULT ('[]'),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `session` ADD CONSTRAINT `session_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX `name_created_at_idx` ON `ip_logs` (`name`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_match_data_user_stats` ON `match_data` (`user_id`,`team_mode`,`rank`,`kills`,`damage_dealt`,`time_alive`);--> statement-breakpoint
CREATE INDEX `idx_game_id` ON `match_data` (`game_id`);--> statement-breakpoint
CREATE INDEX `idx_match_data_team_query` ON `match_data` (`team_mode`,`map_id`,`created_at`,`region`);