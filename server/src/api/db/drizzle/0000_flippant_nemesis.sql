CREATE TABLE `match_data` (
	`user_id` text NOT NULL,
	`gameId` text NOT NULL,
	`slug` text,
	`username` text NOT NULL,
	`player_id` integer NOT NULL,
	`team_id` integer NOT NULL,
	`time_alive` integer NOT NULL,
	`rank` integer NOT NULL,
	`died` integer NOT NULL,
	`kills` integer NOT NULL,
	`damage_dealt` integer NOT NULL,
	`damage_taken` integer NOT NULL,
	`killer_id` integer,
	`killed_ids` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`auth_id` text NOT NULL,
	`slug` text NOT NULL,
	`banned` integer DEFAULT false NOT NULL,
	`ban_reason` text DEFAULT '' NOT NULL,
	`username` text DEFAULT '' NOT NULL,
	`username_set` integer DEFAULT false NOT NULL,
	`user_created` integer DEFAULT (unixepoch()) NOT NULL,
	`last_username_change_time` integer,
	`linked` integer DEFAULT false NOT NULL,
	`linked_google` integer DEFAULT false NOT NULL,
	`loadout` text DEFAULT '{"outfit":"outfitBase","melee":"fists","heal":"heal_basic","boost":"boost_basic","player_icon":"","crosshair":{"type":"crosshair_default","color":16777215,"size":"1.00","stroke":"0.00"},"emotes":["emote_happyface","emote_thumbsup","emote_surviv","emote_sadface","",""]}' NOT NULL,
	`items` text DEFAULT '[]' NOT NULL,
	`wins` integer DEFAULT 0 NOT NULL,
	`games` integer DEFAULT 0 NOT NULL,
	`kills` integer DEFAULT 0 NOT NULL,
	`kpg` integer DEFAULT 0 NOT NULL,
	`modes` text DEFAULT '[{"teamMode":1,"games":0,"wins":0,"kills":0,"winPct":0,"mostKills":0,"mostDamage":0,"kpg":0,"avgDamage":0,"avgTimeAlive":0},{"teamMode":2,"games":0,"wins":0,"kills":0,"winPct":0,"mostKills":0,"mostDamage":0,"kpg":0,"avgDamage":0,"avgTimeAlive":0},{"teamMode":4,"games":0,"wins":0,"kills":0,"winPct":0,"mostKills":0,"mostDamage":0,"kpg":0,"avgDamage":0,"avgTimeAlive":0}]' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_slug_unique` ON `users` (`slug`);