CREATE TABLE `items` (
	`user_id` text NOT NULL,
	`source` text NOT NULL,
	`time_acquired` integer DEFAULT (current_timestamp) NOT NULL,
	`type` text NOT NULL,
	`status` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`type`, `user_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
