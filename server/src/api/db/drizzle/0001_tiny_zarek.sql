CREATE TABLE `match_stats` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`guid` text NOT NULL,
	`region` text NOT NULL,
	`map_id` integer NOT NULL,
	`team_mode` integer NOT NULL,
	`team_count` integer NOT NULL,
	`team_total` integer NOT NULL,
	`end_time` integer NOT NULL,
	`time_alive` integer NOT NULL,
	`rank` integer NOT NULL,
	`kills` integer NOT NULL,
	`team_kills` integer NOT NULL,
	`damage_dealt` integer NOT NULL,
	`damage_taken` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
