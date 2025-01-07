CREATE TABLE `match_data` (
	`user_id` varchar(255) NOT NULL,
	`map_id` int NOT NULL,
	`gameId` varchar(255) NOT NULL,
	`slug` varchar(255),
	`username` varchar(255) NOT NULL,
	`player_id` int NOT NULL,
	`team_mode` int NOT NULL,
	`team_id` int NOT NULL,
	`time_alive` int NOT NULL,
	`rank` int NOT NULL,
	`died` boolean NOT NULL,
	`kills` int NOT NULL,
	`damage_dealt` int NOT NULL,
	`damage_taken` int NOT NULL,
	`killer_id` int,
	`killed_ids` json NOT NULL
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `user_created` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `match_data` ADD CONSTRAINT `match_data_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;