CREATE TABLE `entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`category` text DEFAULT 'work',
	`description` text,
	`date` text DEFAULT 'datetime("now")' NOT NULL
);
