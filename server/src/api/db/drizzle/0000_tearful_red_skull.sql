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
	`user_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`last_username_change_time` timestamp,
	`linked` boolean NOT NULL DEFAULT false,
	`linked_google` boolean NOT NULL DEFAULT false,
	`linked_discord` boolean NOT NULL DEFAULT false,
	`loadout` json NOT NULL DEFAULT ('{"outfit":"outfitBase","melee":"fists","heal":"heal_basic","boost":"boost_basic","player_icon":"","crosshair":{"type":"crosshair_default","color":16777215,"size":"1.00","stroke":"0.00"},"emotes":["emote_happyface","emote_thumbsup","emote_surviv","emote_sadface","",""]}'),
	`items` json NOT NULL DEFAULT ('[]'),
	`wins` int NOT NULL DEFAULT 0,
	`games` int NOT NULL DEFAULT 0,
	`kills` int NOT NULL DEFAULT 0,
	`kpg` int NOT NULL DEFAULT 0,
	`modes` json NOT NULL DEFAULT ('[{"teamMode":1,"games":0,"wins":0,"kills":0,"winPct":0,"mostKills":0,"mostDamage":0,"kpg":0,"avgDamage":0,"avgTimeAlive":0},{"teamMode":2,"games":0,"wins":0,"kills":0,"winPct":0,"mostKills":0,"mostDamage":0,"kpg":0,"avgDamage":0,"avgTimeAlive":0},{"teamMode":4,"games":0,"wins":0,"kills":0,"winPct":0,"mostKills":0,"mostDamage":0,"kpg":0,"avgDamage":0,"avgTimeAlive":0}]'),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `session` ADD CONSTRAINT `session_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;